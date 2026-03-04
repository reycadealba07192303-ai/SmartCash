export interface Lesson {
    id: string;
    title: string;
    duration: string; // e.g., "10 min"
    type: 'video' | 'article' | 'quiz';
    content: string; // Markdown or HTML content
    videoUrl?: string; // Optional for video lessons
    completed: boolean;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    category: 'Financial Literacy' | 'Entrepreneurship' | 'Innovation' | 'Sustainable Finance';
    imageUrl: string; // For the cover card
    progress: number; // 0-100
    lessons: Lesson[];
}

export const modules: Module[] = [
    {
        id: 'fin-lit-1',
        title: 'Financial Literacy 101',
        description: 'Master the basics of money management, budgeting, and saving.',
        category: 'Financial Literacy',
        imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800',
        progress: 35,
        lessons: [
            {
                id: 'l1',
                title: 'Needs vs. Wants',
                duration: '5 min',
                type: 'article',
                completed: true,
                content: `
# Understanding Needs vs. Wants

In this lesson, we explore the fundamental concept of personal finance: distinguishing between what you need and what you want.

## What is a Need?
A **need** is something essential for survival and basic functioning in society. 
- Food and clean water
- Shelter and basic clothing
- Healthcare and hygiene
- Basic transportation and education

## What is a Want?
A **want** is something that improves your quality of life but isn't strictly necessary for survival.
- Dining out at expensive restaurants
- Designer clothing
- The latest smartphone model
- Streaming subscriptions

## The 50/30/20 Rule
A popular budgeting rule suggests:
- **50%** of your income for Needs
- **30%** for Wants
- **20%** for Savings and Debt Repayment
        `
            },
            {
                id: 'l2',
                title: 'The Art of Budgeting',
                duration: '10 min',
                type: 'video',
                videoUrl: 'https://www.youtube.com/embed/sVKQn2I4HDM', // Placeholder
                completed: false,
                content: 'Watch this video to learn how to create a simple budget using the zero-based budgeting method.'
            },
            {
                id: 'l3',
                title: 'Emergency Funds',
                duration: '8 min',
                type: 'article',
                completed: false,
                content: `
# Why You Need an Emergency Fund

Life is unpredictable. An emergency fund is your financial safety net.

## How much should you save?
Most experts recommend having **3 to 6 months** of living expenses saved.

## Where to keep it?
Keep it in a high-yield savings account where it is accessible but separate from your daily spending money.
        `
            }
        ]
    },
    {
        id: 'ent-1',
        title: 'Entrepreneurship Basics',
        description: 'Turn your ideas into a real business. Learn planning and execution.',
        category: 'Entrepreneurship',
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
        progress: 0,
        lessons: [
            {
                id: 'e1',
                title: 'Finding a Problem to Solve',
                duration: '15 min',
                type: 'article',
                completed: false,
                content: 'Great businesses solve real problems. Learn how to identify pain points in your community.'
            },
            {
                id: 'e2',
                title: 'Writing a Business Plan',
                duration: '20 min',
                type: 'article',
                completed: false,
                content: 'A business plan is your roadmap. We will walk through the key sections: Executive Summary, Market Analysis, and Financial Projections.'
            }
        ]
    },
    {
        id: 'inn-1',
        title: 'Innovation & Tech',
        description: 'Leverage technology and social media to grow your brand.',
        category: 'Innovation',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
        progress: 0,
        lessons: [
            {
                id: 'i1',
                title: 'Social Media Marketing 101',
                duration: '12 min',
                type: 'video',
                videoUrl: 'https://www.youtube.com/embed/example',
                completed: false,
                content: 'Learn how to use platforms like TikTok and Instagram to market your small business for free.'
            }
        ]
    }
];
