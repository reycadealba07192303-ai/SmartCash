-- ==========================================
-- SMARTCASH: LESSONS RELATED TABLES
-- ==========================================

-- 1. LEARNING LESSONS
create table if not exists learning_lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references learning_modules on delete cascade,
  title text not null,
  description text,
  content text not null, -- The actual text/HTML content of the lesson
  video_url text, -- Optional video link
  type text not null check (type in ('video', 'article')),
  duration text not null, -- e.g., "10 min"
  order_index integer not null default 0, -- To keep lessons in a specific order within a module
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table learning_lessons enable row level security;
create policy "Lessons viewable by everyone" on learning_lessons for select using (true);
create policy "Teachers can insert lessons" on learning_lessons for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can update lessons" on learning_lessons for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);
create policy "Teachers can delete lessons" on learning_lessons for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('teacher', 'admin'))
);


-- 2. USER LESSON PROGRESS (Tracking completed lessons)
create table if not exists user_lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null on delete cascade,
  lesson_id uuid references learning_lessons not null on delete cascade,
  completed boolean default true,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, lesson_id) -- A user can only have one progress record per lesson
);

alter table user_lesson_progress enable row level security;
create policy "Users can view their own lesson progress" on user_lesson_progress for select using (auth.uid() = user_id);
create policy "Users can update their own lesson progress" on user_lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can modify their own lesson progress" on user_lesson_progress for update using (auth.uid() = user_id);
