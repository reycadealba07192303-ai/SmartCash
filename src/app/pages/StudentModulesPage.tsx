import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './dashboard/DashboardLayout';
import {
    BookOpen, CheckCircle, Clock, PlayCircle, Trophy, ChevronRight,
    Loader2, AlertCircle, FileQuestion, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'article';
    duration: string;
    completed: boolean;
    order_index: number;
}

interface ModuleProgress {
    id: string;
    title: string;
    description: string;
    category: string;
    progress: number;
    totalLessons: number;
    completedCount: number;
    lessons: Lesson[];
    quizId?: string;
    quizTitle?: string;
    quizCompleted?: boolean;
}

const StudentModulesPage: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [modules, setModules] = useState<ModuleProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            try {
                // Load modules + lessons progress
                const modRes = await fetch('https://smartcash-eudv.onrender.com/api/student/modules', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!modRes.ok) throw new Error('Failed to load modules');
                const modsData: ModuleProgress[] = await modRes.json();

                // Read locally stored completed quiz IDs (set by QuizInterface on completion)
                const completedQuizIds: string[] = JSON.parse(localStorage.getItem('completedQuizIds') || '[]');

                // For each module, check if there's a quiz and if it's been done
                const enriched = await Promise.all(modsData.map(async (mod) => {
                    try {
                        const qRes = await fetch(`https://smartcash-eudv.onrender.com/api/student/quizzes/module/${mod.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (qRes.ok) {
                            const qData = await qRes.json();
                            const quizDone = completedQuizIds.includes(String(qData.id));
                            return { ...mod, quizId: qData.id, quizTitle: qData.title, quizCompleted: quizDone };
                        }
                    } catch { /* no quiz for this module */ }
                    return mod;
                }));

                setModules(enriched);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    const getStatusLabel = (mod: ModuleProgress) => {
        if (mod.completedCount === 0) return { label: 'Not Started', color: 'text-slate-400 bg-slate-100 dark:bg-slate-800' };
        if (mod.progress >= 100) return { label: 'Completed', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' };
        return { label: 'In Progress', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' };
    };

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex justify-center items-center py-32">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout role="student">
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <AlertCircle size={40} className="text-red-500 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">{error}</p>
                </div>
            </DashboardLayout>
        );
    }

    const totalModules = modules.length;
    const completedModules = modules.filter(m => m.progress >= 100).length;
    const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
    const completedLessons = modules.reduce((s, m) => s + m.completedCount, 0);

    return (
        <DashboardLayout role="student">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">My Modules</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your lessons, quizzes, and overall progress.</p>
                </header>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Modules', value: totalModules, icon: BookOpen, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
                        { label: 'Completed', value: completedModules, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Total Lessons', value: totalLessons, icon: PlayCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Lessons Done', value: completedLessons, icon: Trophy, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
                    ].map(card => (
                        <div key={card.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                                <card.icon size={20} />
                            </div>
                            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p>
                            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Overall progress bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Overall Progress</span>
                        <span className="text-sm font-bold text-emerald-600">
                            {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                        </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Module list */}
                <div className="space-y-4">
                    {modules.length === 0 && (
                        <div className="text-center py-16 text-slate-400">
                            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No modules assigned yet.</p>
                        </div>
                    )}

                    {modules.map(mod => {
                        const status = getStatusLabel(mod);
                        const isExpanded = expandedId === mod.id;
                        const isLocked = mod.completedCount === 0;

                        return (
                            <div key={mod.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                {/* Module header — click to expand */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : mod.id)}
                                    className="w-full text-left p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.progress >= 100 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
                                        {mod.progress >= 100 ? <CheckCircle size={24} /> : isLocked ? <Lock size={22} /> : <BookOpen size={22} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{mod.title}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-2">{mod.description}</p>

                                        {/* Mini progress bar */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${mod.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                                                {mod.completedCount}/{mod.totalLessons} lessons
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight
                                        size={20}
                                        className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                    />
                                </button>

                                {/* Expanded lesson list */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 dark:border-slate-800">
                                        {/* Lessons */}
                                        <div className="p-4 space-y-2">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Lessons</p>
                                            {mod.lessons.length === 0 ? (
                                                <p className="text-sm text-slate-400 px-1">No lessons yet.</p>
                                            ) : (
                                                mod.lessons.map((lesson, idx) => {
                                                    // A lesson is accessible if the previous one is done (or it's the first)
                                                    const prevDone = idx === 0 || mod.lessons[idx - 1]?.completed;
                                                    const accessible = lesson.completed || prevDone;
                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            disabled={!accessible}
                                                            onClick={() => navigate(`/dashboard/student/lessons/${mod.id}?lesson=${lesson.id}`)}
                                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${accessible ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                                                        >
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${lesson.completed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                                {lesson.completed ? <CheckCircle size={14} /> : idx + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-semibold truncate ${lesson.completed ? 'text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                    {lesson.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <Clock size={11} className="text-slate-400" />
                                                                    <span className="text-xs text-slate-400">{lesson.duration}</span>
                                                                    <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                                                                    <span className="text-xs text-slate-400 capitalize">{lesson.type}</span>
                                                                </div>
                                                            </div>
                                                            {lesson.completed && (
                                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Done</span>
                                                            )}
                                                            {!lesson.completed && accessible && (
                                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">Continue</span>
                                                            )}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {/* Quiz row */}
                                        <div className="px-4 pb-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Quiz</p>
                                            {mod.quizId ? (
                                                <button
                                                    onClick={() => navigate(`/dashboard/student/quiz/${mod.quizId}`)}
                                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left border border-indigo-100 dark:border-indigo-900/30"
                                                >
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${mod.quizCompleted ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'}`}>
                                                        {mod.quizCompleted ? <CheckCircle size={14} /> : <FileQuestion size={14} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{mod.quizTitle || `${mod.title} Quiz`}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{mod.quizCompleted ? 'Completed — click to retake' : 'Take the quiz to test your understanding'}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                                                    <FileQuestion size={16} />
                                                    <p className="text-sm">No quiz assigned for this module yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* CTA: start / continue lesson */}
                                        {mod.progress < 100 && mod.lessons.length > 0 && (
                                            <div className="px-4 pb-4">
                                                <button
                                                    onClick={() => {
                                                        const ongoing = mod.lessons.find(l => !l.completed) || mod.lessons[0];
                                                        navigate(`/dashboard/student/lessons/${mod.id}?lesson=${ongoing.id}`);
                                                    }}
                                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                                                >
                                                    <PlayCircle size={16} />
                                                    {mod.completedCount === 0 ? 'Start Module' : 'Continue Learning'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentModulesPage;
