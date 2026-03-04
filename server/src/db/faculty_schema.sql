-- ==========================================
-- SMARTCASH: FACULTY PORTAL RELATED TABLES
-- ==========================================

-- 1. LEARNING MODULES
create table if not exists learning_modules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null check (category in ('Financial Literacy', 'Entrepreneurship', 'Investing')),
  image_url text,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table learning_modules enable row level security;
create policy "Modules viewable by everyone" on learning_modules for select using (true);
create policy "Teachers can insert modules" on learning_modules for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can update modules" on learning_modules for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can delete modules" on learning_modules for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);


-- 2. QUIZZES
create table if not exists quizzes (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references learning_modules on delete cascade,
  title text not null,
  description text,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table quizzes enable row level security;
create policy "Quizzes viewable by everyone" on quizzes for select using (true);
create policy "Teachers can insert quizzes" on quizzes for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can update quizzes" on quizzes for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can delete quizzes" on quizzes for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);


-- 3. FORUM POSTS
create table if not exists forum_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references auth.users not null,
  title text not null,
  content text not null,
  is_flagged boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table forum_posts enable row level security;
create policy "Forum posts viewable by everyone" on forum_posts for select using (true);
create policy "Students can insert forum posts" on forum_posts for insert with check (true);
create policy "Teachers can update/flag posts" on forum_posts for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can delete posts" on forum_posts for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);

-- Note: In a complete LMS you would also need `learning_lessons` and `quiz_questions`, 
-- but this provides the structure needed to make the Faculty Overviews functional.
