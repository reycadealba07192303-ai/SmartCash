import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from './dashboard/DashboardLayout';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Play, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
// import ReactMarkdown from 'react-markdown'; // Retaining comment logic

interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string;
    content: string;
    video_url?: string;
    type: 'video' | 'article';
    duration: string;
    order_index: number;
    completed?: boolean;
    learning_modules?: { title: string };
}

interface Module {
    id: string;
    title: string;
    lessons: Pick<Lesson, 'id' | 'title' | 'duration' | 'type' | 'completed'>[];
}

// Small helper component: fetches the quiz for this module then navigates to it
const TakeQuizButton: React.FC<{ moduleId: string; token: string; navigate: (path: string) => void }> = ({ moduleId, token, navigate }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/student/quizzes/module/${moduleId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('No quiz found');
            const data = await res.json();
            navigate(`/dashboard/student/quiz/${data.id}`);
        } catch {
            alert('No quiz available for this module yet. Please check back later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Take Quiz
        </button>
    );
};

const LessonContent: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [searchParams] = useSearchParams();
    const lessonId = searchParams.get('lesson');
    const navigate = useNavigate();
    const { token } = useAuth();

    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [moduleContext, setModuleContext] = useState<Module | null>(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    // Fetch the specific lesson
    useEffect(() => {
        const fetchLessonData = async () => {
            if (!token || !lessonId || !moduleId) return;
            setLoading(true);
            try {
                // Fetch the single lesson details
                const lessonRes = await fetch(`https://smartcash-eudv.onrender.com/api/student/lessons/${lessonId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!lessonRes.ok) throw new Error('Lesson not found');
                const lessonData = await lessonRes.json();
                setActiveLesson(lessonData);

                // Fetch module context to build the sidebar
                const moduleRes = await fetch(`https://smartcash-eudv.onrender.com/api/student/modules`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (moduleRes.ok) {
                    const modulesData = await moduleRes.json();
                    const currentModule = modulesData.find((m: any) => m.id === moduleId);
                    if (currentModule) setModuleContext(currentModule);
                }

            } catch (err) {
                console.error("Error fetching lesson:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLessonData();
    }, [lessonId, moduleId, token]);

    const handleMarkComplete = async () => {
        if (!token || !activeLesson || activeLesson.completed || marking) return;
        setMarking(true);
        try {
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/student/lessons/${activeLesson.id}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Update local state to reflect completion instantly
                setActiveLesson(prev => prev ? { ...prev, completed: true } : null);
                if (moduleContext) {
                    setModuleContext(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            lessons: prev.lessons.map(l => l.id === activeLesson.id ? { ...l, completed: true } : l)
                        };
                    });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMarking(false);
        }
    };


    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (!moduleContext || !activeLesson) {
        return (
            <DashboardLayout role="student">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <h2 className="text-xl font-bold">Lesson not found</h2>
                    <Link to="/dashboard/student/lessons" className="text-emerald-600 hover:underline mt-2">Back to Modules</Link>
                </div>
            </DashboardLayout>
        );
    }

    const currentLessonIndex = moduleContext.lessons.findIndex(l => l.id === activeLesson.id);
    const nextLesson = moduleContext.lessons[currentLessonIndex + 1];
    const prevLesson = moduleContext.lessons[currentLessonIndex - 1];

    return (
        <DashboardLayout role="student">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]">

                {/* Sidebar Navigation */}
                <div className="lg:w-80 flex-shrink-0 flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm h-full">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                        <Link to="/dashboard/student/lessons" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors mb-4">
                            <ChevronLeft size={16} />
                            Back to Modules
                        </Link>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{moduleContext.title}</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {moduleContext.lessons.map((lesson, idx) => (
                            <button
                                key={lesson.id}
                                onClick={() => navigate(`/dashboard/student/lessons/${moduleContext.id}?lesson=${lesson.id}`)}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${activeLesson.id === lesson.id
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${activeLesson.id === lesson.id
                                    ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <span className="block font-semibold text-sm line-clamp-1">{lesson.title}</span>
                                    <span className="text-[10px] opacity-70 flex items-center gap-1 mt-0.5">
                                        <Clock size={10} /> {lesson.duration}
                                    </span>
                                </div>
                                {lesson.completed && <CheckCircle size={14} className="ml-auto text-emerald-500 mt-1" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* content Area */}
                <div className="flex-1 overflow-y-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col">
                    {/* Header */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wide">
                                {activeLesson.type}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 text-sm">
                                <Clock size={14} /> {activeLesson.duration}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{activeLesson.title}</h1>
                        <p className="text-slate-500 mt-2">{activeLesson.description}</p>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 px-8 py-4">
                        {activeLesson.type === 'video' && activeLesson.video_url && (
                            <div className="aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden shadow-lg mb-8 relative group">
                                {activeLesson.video_url.includes('youtube.com') || activeLesson.video_url.includes('youtu.be') ? (
                                    <iframe
                                        src={activeLesson.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                        title={activeLesson.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video src={activeLesson.video_url} controls className="w-full h-full object-cover" />
                                )}
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {/* In a real app with ReactMarkdown, you would use it here */}
                            {activeLesson.content}
                        </div>

                        {!activeLesson.completed && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={marking}
                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {marking ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    Mark as Completed
                                </button>
                            </div>
                        )}
                        {activeLesson.completed && (
                            <div className="mt-12 flex justify-center">
                                <div className="px-8 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle size={20} />
                                    Completed
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Navigation */}
                    <div className="p-8 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            disabled={!prevLesson}
                            onClick={() => prevLesson && navigate(`/dashboard/student/lessons/${moduleId}?lesson=${prevLesson.id}`)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>

                        <div className="flex gap-3">
                            {activeLesson.completed && (
                                <TakeQuizButton moduleId={moduleId!} token={token!} navigate={navigate} />
                            )}
                            <button
                                onClick={() => {
                                    if (nextLesson) {
                                        navigate(`/dashboard/student/lessons/${moduleId}?lesson=${nextLesson.id}`);
                                    } else {
                                        navigate('/dashboard/student/lessons'); // Completed module
                                    }
                                }}
                                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-slate-900/10"
                            >
                                {nextLesson ? (
                                    <>
                                        Next Lesson <ChevronRight size={18} />
                                    </>
                                ) : (
                                    <>
                                        Complete Module <CheckCircle size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LessonContent;
