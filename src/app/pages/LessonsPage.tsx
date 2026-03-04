import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from './dashboard/DashboardLayout';
import { Play, BookOpen, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'article';
    duration: string;
    completed: boolean;
}

interface Module {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    progress: number;
    lessons: Lesson[];
}

const LessonsPage: React.FC = () => {
    const { token } = useAuth();
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            if (!token) return;
            try {
                const response = await fetch('https://smartcash-eudv.onrender.com/api/student/modules', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch modules');
                const data = await response.json();
                setModules(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchModules();
    }, [token]);

    return (
        <DashboardLayout role="student">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Learning Modules</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Master financial skills with these interactive lessons.</p>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-500 p-6 rounded-2xl flex items-center justify-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                ) : modules.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        No modules available yet. Check back later!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {modules.map((module) => (
                            <div key={module.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="h-48 relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                                    {module.imageUrl && (
                                        <img
                                            src={module.imageUrl}
                                            alt={module.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white mb-2 ${module.category === 'Financial Literacy' ? 'bg-emerald-500' :
                                            module.category === 'Entrepreneurship' ? 'bg-blue-500' :
                                                'bg-purple-500'
                                            }`}>
                                            {module.category}
                                        </span>
                                        <h3 className="text-xl font-bold text-white leading-tight">{module.title}</h3>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                                        {module.description}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        {module.lessons.map((lesson, idx) => (
                                            <div key={lesson.id} className="flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${lesson.completed
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {lesson.completed ? <CheckCircle size={16} /> : <span className="font-bold text-xs">{idx + 1}</span>}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className={`font-semibold line-clamp-1 ${lesson.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {lesson.duration}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{lesson.type}</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/dashboard/student/lessons/${module.id}?lesson=${lesson.id}`}
                                                    className={`p-2 rounded-lg transition-colors shrink-0 ${lesson.completed
                                                        ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90'
                                                        }`}
                                                >
                                                    {lesson.type === 'video' ? <Play size={14} fill={lesson.completed ? 'none' : 'currentColor'} /> : <BookOpen size={14} />}
                                                </Link>
                                            </div>
                                        ))}

                                        {module.lessons.length === 0 && (
                                            <div className="text-center text-sm text-slate-400 py-4">
                                                No lessons in this module yet.
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <span>{Math.round(module.progress)}% Completed</span>
                                        <div className="w-1/2 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${module.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LessonsPage;
