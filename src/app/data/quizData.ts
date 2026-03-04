export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
    explanation: string;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    category: 'Financial Literacy' | 'Entrepreneurship' | 'Innovation';
    questions: Question[];
}

export const quizzes: Quiz[] = [
    {
        id: 'fl-101',
        title: 'Financial Literacy 101: Needs vs Wants',
        description: 'Test your knowledge on budgeting basics and spending wisely.',
        category: 'Financial Literacy',
        questions: [
            {
                id: 1,
                text: 'Which of the following is considered a "Need"?',
                options: ['Latest Smartphone', 'Basic Food & Water', 'Netflix Subscription', 'Designer Clothes'],
                correctAnswer: 1,
                explanation: 'Needs are essentials required for survival and basic functioning, like food, water, and shelter.'
            },
            {
                id: 2,
                text: 'What is the primary purpose of a budget?',
                options: ['To restrict you from having fun', 'To track income and control expenses', 'To calculate your net worth', 'To apply for a loan'],
                correctAnswer: 1,
                explanation: 'A budget helps you understand where your money goes and ensures you don\'t spend more than you earn.'
            },
            {
                id: 3,
                text: 'Which formula represents the basic accounting equation?',
                options: ['Assets = Liabilities + Equity', 'Income - Expenses = Profit', 'Assets - Liabilities = Equity', 'All of the above'],
                correctAnswer: 0,
                explanation: 'Assets = Liabilities + Equity is the fundamental accounting equation.'
            },
            {
                id: 4,
                text: 'If you want to save money, what should you pay first?',
                options: ['Your bills', 'Your wants', 'Yourself (Savings)', 'Your debts'],
                correctAnswer: 2,
                explanation: 'Paying yourself first means setting aside savings before spending on anything else.'
            },
            {
                id: 5,
                text: 'What is an "Emergency Fund" used for?',
                options: ['Vacations', 'Buying a new car', 'Unexpected expenses like medical bills', 'Investing in stocks'],
                correctAnswer: 2,
                explanation: 'An emergency fund is money set aside specifically for unforeseen financial surprises.'
            }
        ]
    },
    {
        id: 'ent-101',
        title: 'Entrepreneurship Basics',
        description: 'Learn the fundamentals of starting a small business.',
        category: 'Entrepreneurship',
        questions: [
            {
                id: 1,
                text: 'What is the first step in starting a business?',
                options: ['Buying inventory', 'Identifying a problem/need', 'Hiring employees', 'Renting an office'],
                correctAnswer: 1,
                explanation: 'Successful businesses start by solving a specific problem or fulfilling a need in the market.'
            },
            {
                id: 2,
                text: 'What does ROI stand for?',
                options: ['Rate of Inflation', 'Return on Investment', 'Risk of Insurance', 'Revenue on Interest'],
                correctAnswer: 1,
                explanation: 'ROI measures the gain or loss generated on an investment relative to the amount of money invested.'
            }
        ]
    }
];
