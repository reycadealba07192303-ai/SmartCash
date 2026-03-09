import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './dashboard/DashboardLayout';
import {
    BookOpen, CheckCircle, Clock, PlayCircle, Trophy, ChevronRight,
    Loader2, AlertCircle, FileQuestion, Lock, RefreshCcw, X, ChevronDown
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

interface QuizHistoryItem {
    id: string;
    quiz_id: string;
    quiz_title: string;
    score: number;
    total: number;
    percentage: number;
    answers?: number[];
    questions?: { text: string; options: string[]; correctAnswer: number }[];
    taken_at: string;
}

const StudentModulesPage: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [modules, setModules] = useState<ModuleProgress[]>([]);
    const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
    const [selectedQuizHistory, setSelectedQuizHistory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);

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

                // Fetch Quiz History
                const histRes = await fetch('https://smartcash-eudv.onrender.com/api/student/quizzes/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (histRes.ok) {
                    const histData = await histRes.json();
                    setQuizHistory(histData);
                }

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

    // Group quiz history by unique quiz_id, keeping the one with the highest percentage to show on the main card
    const uniqueQuizzes = Object.values(quizHistory.reduce((acc, curr) => {
        if (!acc[curr.quiz_id] || curr.percentage > acc[curr.quiz_id].percentage) {
            acc[curr.quiz_id] = curr;
        }
        return acc;
    }, {} as Record<string, QuizHistoryItem>));

    // Get the history specifically for the modal
    const historyForModal = quizHistory.filter(h => h.quiz_id === selectedQuizHistory);
    const selectedQuizTitle = historyForModal.length > 0 ? historyForModal[0].quiz_title : '';

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

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* Module list (Left Column) */}
                    <div className="space-y-4 h-full">
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl p-8 flex flex-col h-[500px]">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex-shrink-0">
                                <div className="p-2.5 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                                    <BookOpen size={22} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    Available Modules
                                </h2>
                            </div>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
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
                    </div>

                    {/* Quiz History (Right Column) */}
                    <div className="space-y-4 h-full">
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl p-8 flex flex-col h-[500px]">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 flex-shrink-0">
                                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-amber-500/30">
                                    <Trophy size={22} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    Quiz History
                                </h2>
                            </div>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                {quizHistory.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/50">
                                        <FileQuestion size={40} className="mx-auto mb-4 opacity-40 text-slate-400" />
                                        <p className="text-sm font-semibold">No quizzes taken yet.</p>
                                        <p className="text-xs text-slate-500 mt-1">Complete a module to start earning scores!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {uniqueQuizzes.map((history, idx) => {
                                            const totalAttempts = quizHistory.filter(h => h.quiz_id === history.quiz_id).length;
                                            const isGoodScore = history.percentage >= 80;
                                            const scoreColor = isGoodScore ? 'text-emerald-500' : 'text-amber-500';
                                            const bgHover = isGoodScore ? 'hover:border-emerald-500/30 hover:shadow-emerald-500/5' : 'hover:border-amber-500/30 hover:shadow-amber-500/5';

                                            return (
                                                <div
                                                    key={history.id || idx}
                                                    className={`group relative bg-white dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg ${bgHover}`}
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1 pr-4">
                                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors">
                                                                {history.quiz_title}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                                <Clock size={12} />
                                                                {new Date(history.taken_at).toLocaleDateString(undefined, {
                                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold leading-none ring-1 ring-inset ${isGoodScore ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 ring-emerald-500/30' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 ring-amber-500/30'}`}>
                                                                Highest: {history.score}/{history.total} ({Math.round(history.percentage)}%)
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 mt-1 font-medium">{totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setSelectedQuizHistory(history.quiz_id)}
                                                        className="w-full py-2.5 rounded-xl text-sm font-bold bg-slate-50 hover:bg-emerald-50 dark:bg-slate-900/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                                                    >
                                                        <Clock size={15} />
                                                        View History
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiz History Detailed Modal */}
            {
                selectedQuizHistory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                        {selectedQuizTitle}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                        Detailed Attempt History
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedQuizHistory(null);
                                        setExpandedAttemptId(null);
                                    }}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                                {historyForModal.map((attempt, index) => {
                                    const isGoodScore = attempt.percentage >= 80;
                                    const isExpanded = expandedAttemptId === (attempt.id || String(index));
                                    const attemptHasReview = attempt.questions && attempt.questions.length > 0 && attempt.answers && attempt.answers.length > 0;

                                    return (
                                        <div key={attempt.id || index} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden transition-all">
                                            <button
                                                onClick={() => setExpandedAttemptId(isExpanded ? null : (attempt.id || String(index)))}
                                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-sm border border-slate-200 dark:border-slate-600">
                                                        #{historyForModal.length - index}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                            {new Date(attempt.taken_at).toLocaleDateString(undefined, {
                                                                month: 'long', day: 'numeric', year: 'numeric'
                                                            })}
                                                        </p>
                                                        <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {new Date(attempt.taken_at).toLocaleTimeString(undefined, {
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold ring-1 ring-inset shadow-sm ${isGoodScore ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 ring-emerald-500/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 ring-rose-500/30'}`}>
                                                            {attempt.score} / {attempt.total}
                                                        </div>
                                                        <span className={`text-[11px] font-bold ${isGoodScore ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {Math.round(attempt.percentage)}%
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </button>

                                            {/* Expanded Answers View */}
                                            {isExpanded && attemptHasReview && (
                                                <div className="border-t border-slate-100 dark:border-slate-700/50 p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                    {attempt.questions!.map((q, qIndex) => {
                                                        const userAnswerIndex = attempt.answers![qIndex];
                                                        const isCorrect = userAnswerIndex === q.correctAnswer;
                                                        const isUnanswered = userAnswerIndex === undefined || userAnswerIndex === -1;

                                                        return (
                                                            <div key={qIndex} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700/80 shadow-sm">
                                                                <div className="flex items-start gap-3 mb-3">
                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                        {qIndex + 1}
                                                                    </span>
                                                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 pt-0.5 leading-snug">
                                                                        {q.text}
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-2 pl-9">
                                                                    {q.options.map((option, optIdx) => {
                                                                        const isSelected = optIdx === userAnswerIndex;
                                                                        const isActuallyCorrect = optIdx === q.correctAnswer;

                                                                        let borderClass = 'border-slate-100 dark:border-slate-700';
                                                                        let bgClass = 'bg-slate-50 dark:bg-slate-800/50';
                                                                        let textClass = 'text-slate-600 dark:text-slate-400';
                                                                        let icon = null;

                                                                        if (isSelected && isCorrect) {
                                                                            borderClass = 'border-emerald-500 dark:border-emerald-500/50';
                                                                            bgClass = 'bg-emerald-50 dark:bg-emerald-500/10';
                                                                            textClass = 'text-emerald-700 dark:text-emerald-300 font-medium';
                                                                            icon = <CheckCircle size={14} className="text-emerald-500" />;
                                                                        } else if (isSelected && !isCorrect) {
                                                                            borderClass = 'border-rose-500 dark:border-rose-500/50';
                                                                            bgClass = 'bg-rose-50 dark:bg-rose-500/10';
                                                                            textClass = 'text-rose-700 dark:text-rose-300 font-medium';
                                                                            icon = <X size={14} className="text-rose-500" />;
                                                                        } else if (isActuallyCorrect && !isSelected) {
                                                                            borderClass = 'border-emerald-500 border-dashed dark:border-emerald-500/30';
                                                                            bgClass = 'bg-white dark:bg-slate-800/80';
                                                                            textClass = 'text-emerald-600 dark:text-emerald-400';
                                                                            icon = <CheckCircle size={14} className="text-emerald-500 opacity-60" />;
                                                                        }

                                                                        return (
                                                                            <div key={optIdx} className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${borderClass} ${bgClass} transition-colors`}>
                                                                                <span className={textClass}>{option}</span>
                                                                                {icon}
                                                                            </div>
                                                                        );
                                                                    })}

                                                                    {isUnanswered && (
                                                                        <div className="mt-2 text-xs font-medium text-rose-500 flex items-center gap-1.5">
                                                                            <AlertCircle size={12} />
                                                                            You didn't answer this question.
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
                                <button
                                    onClick={() => {
                                        setSelectedQuizHistory(null);
                                        navigate(`/dashboard/student/quiz/${selectedQuizHistory}`);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-emerald-900/20 transition-all active:scale-[0.98]"
                                >
                                    <RefreshCcw size={18} />
                                    Retake This Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </DashboardLayout >
    );
};

export default StudentModulesPage;
