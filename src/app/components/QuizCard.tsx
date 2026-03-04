import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ClipboardCheck } from 'lucide-react';
import { Quiz } from '../data/quizData';

interface QuizCardProps {
    quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
    return (
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${quiz.category === 'Financial Literacy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                        quiz.category === 'Entrepreneurship' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                    }`}>
                    <ClipboardCheck size={24} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${quiz.category === 'Financial Literacy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                        quiz.category === 'Entrepreneurship' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                    {quiz.category}
                </span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {quiz.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                {quiz.description}
            </p>

            <Link
                to={`/dashboard/student/quiz/${quiz.id}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:opacity-90 transition-opacity"
            >
                <Play size={16} fill="currentColor" />
                Start Quiz
            </Link>
        </div>
    );
};

export default QuizCard;
