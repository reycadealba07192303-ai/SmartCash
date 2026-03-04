import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { Plus, BookOpen, Video, FileText, Edit, Trash2, Eye, Loader2, AlertCircle, X, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface Lesson {
    id: string;
    title: string;
    type: 'video' | 'article';
    duration: string;
}

interface ModuleData {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    lessons?: Lesson[];
}

interface QuizData {
    id: string;
    title: string;
    description: string;
    learning_modules?: { title: string };
    questions?: { text: string; options: string[]; correctAnswer: number }[];
}

const FacultyContentPage: React.FC = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes'>('lessons');

    const [modules, setModules] = useState<ModuleData[]>([]);
    const [quizzes, setQuizzes] = useState<QuizData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

    // Modal States
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [activeModuleForLesson, setActiveModuleForLesson] = useState<string>('');

    // Form States
    const [newModule, setNewModule] = useState({ title: '', description: '', category: 'Financial Literacy', imageUrl: '' });
    const [newQuiz, setNewQuiz] = useState({ title: '', description: '', moduleId: '', questions: [] as any[] });
    const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', videoUrl: '', type: 'article', duration: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingAILesson, setIsGeneratingAILesson] = useState(false);
    const [isGeneratingAIQuiz, setIsGeneratingAIQuiz] = useState(false);
    const [isGeneratingLessons, setIsGeneratingLessons] = useState(false);

    // Preview states
    const [previewQuiz, setPreviewQuiz] = useState<QuizData | null>(null);
    const [previewLesson, setPreviewLesson] = useState<{ title: string; content: string; type: string; duration: string } | null>(null);
    const [loadingLesson, setLoadingLesson] = useState(false);

    const handleGenerateAIQuiz = async () => {
        if (!newQuiz.title) {
            alert('Please provide a quiz title first so the AI knows what to generate.');
            return;
        }

        setIsGeneratingAIQuiz(true);
        try {
            const res = await fetch('http://localhost:5000/api/ai/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ lessonContent: `${newQuiz.title}. ${newQuiz.description}`, numQuestions: 5 })
            });

            if (!res.ok) throw new Error('Failed to generate AI quiz');

            const data = await res.json();
            setNewQuiz(prev => ({ ...prev, questions: data.questions }));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsGeneratingAIQuiz(false);
        }
    };

    const handleGenerateAILesson = async () => {
        if (!newLesson.title) {
            alert('Please provide a lesson title first so the AI knows what to generate.');
            return;
        }

        setIsGeneratingAILesson(true);
        try {
            const res = await fetch('http://localhost:5000/api/ai/generate-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ topic: newLesson.title, description: newLesson.description })
            });

            if (!res.ok) throw new Error('Failed to generate AI lesson');

            const data = await res.json();
            setNewLesson(prev => ({ ...prev, content: data.content, type: 'article' }));
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsGeneratingAILesson(false);
        }
    };

    const fetchData = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            // We use the student/modules endpoint here because it already aggregates lessons perfectly for display
            const [modRes, quizRes] = await Promise.all([
                fetch('http://localhost:5000/api/student/modules', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/faculty/quizzes', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!modRes.ok || !quizRes.ok) throw new Error('Failed to fetch content');

            const modData = await modRes.json();
            const quizData = await quizRes.json();

            setModules(modData);
            setQuizzes(quizData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Step 1: Create the module
            const res = await fetch('http://localhost:5000/api/faculty/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newModule)
            });
            if (!res.ok) throw new Error('Failed to create module');
            const createdModule = await res.json();
            const moduleId = createdModule._id || createdModule.id;

            // Step 2: Auto-generate AI lessons for the module
            setIsGeneratingLessons(true);
            try {
                await fetch('http://localhost:5000/api/ai/generate-module-lessons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        moduleId,
                        moduleTitle: newModule.title,
                        category: newModule.category
                    })
                });
            } catch (lessonErr) {
                console.warn('AI lesson generation failed, module still created:', lessonErr);
            } finally {
                setIsGeneratingLessons(false);
            }

            await fetchData();
            setIsModuleModalOpen(false);
            setNewModule({ title: '', description: '', category: 'Financial Literacy', imageUrl: '' });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/faculty/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...newLesson, moduleId: activeModuleForLesson })
            });
            if (!res.ok) throw new Error('Failed to create lesson');
            await fetchData();
            setIsLessonModalOpen(false);
            setNewLesson({ title: '', description: '', content: '', videoUrl: '', type: 'article', duration: '' });
            setExpandedModuleId(activeModuleForLesson); // Keep it open to see the new lesson
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/faculty/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newQuiz)
            });
            if (!res.ok) throw new Error('Failed to create quiz');
            await fetchData();
            setIsQuizModalOpen(false);
            setNewQuiz({ title: '', description: '', moduleId: '', questions: [] });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this module and ALL its lessons/quizzes?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/faculty/modules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete module');
            if (expandedModuleId === id) setExpandedModuleId(null);
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/faculty/lessons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete lesson');
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteQuiz = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quiz?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/faculty/quizzes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete quiz');
            await fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const toggleModuleExpansion = (id: string) => {
        setExpandedModuleId(expandedModuleId === id ? null : id);
    };

    const openLessonModalForModule = (moduleId: string) => {
        setActiveModuleForLesson(moduleId);
        setIsLessonModalOpen(true);
    };

    return (
        <>
            <DashboardLayout role="teacher">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Content Management</h1>
                            <p className="text-slate-500 dark:text-slate-400">Create and edit learning modules and quizzes.</p>
                        </div>
                        <button
                            onClick={() => activeTab === 'lessons' ? setIsModuleModalOpen(true) : setIsQuizModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create {activeTab === 'lessons' ? 'Module' : 'Quiz'}
                        </button>
                    </header>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-8">
                        <button
                            onClick={() => setActiveTab('lessons')}
                            className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'lessons' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                            Learning Modules
                            {activeTab === 'lessons' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('quizzes')}
                            className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'quizzes' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                        >
                            Quizzes & Assessments
                            {activeTab === 'quizzes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>}
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4">
                            <AlertCircle />
                            <span className="font-bold">{error}</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {activeTab === 'lessons' ? (
                                modules.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">No modules found. Create one to get started!</div>
                                ) : (
                                    modules.map(module => (
                                        <div key={module.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm transition-all flex flex-col">
                                            <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                                                <div className="w-full md:w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800">
                                                    {module.imageUrl && <img src={module.imageUrl} alt={module.title} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex-1 cursor-pointer" onClick={() => toggleModuleExpansion(module.id)}>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${module.category === 'Financial Literacy' ? 'bg-emerald-100 text-emerald-700' :
                                                            module.category === 'Entrepreneurship' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                            }`}>{module.category}</span>
                                                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                            {module.lessons?.length || 0} Lessons
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 hover:text-emerald-600 transition-colors flex items-center gap-2">
                                                        {module.title}
                                                        {expandedModuleId === module.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{module.description}</p>
                                                </div>
                                                <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800/50">
                                                    <button onClick={(e) => { e.stopPropagation(); openLessonModalForModule(module.id); }} className="p-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-bold">
                                                        <Plus size={16} /> Add Lesson
                                                    </button>
                                                    <button onClick={() => handleDeleteModule(module.id)} className="p-2.5 text-sm font-bold rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-colors">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {expandedModuleId === module.id && (
                                                <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 p-6">
                                                    <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                        <BookOpen size={16} /> Module Lessons
                                                    </h4>

                                                    {(!module.lessons || module.lessons.length === 0) ? (
                                                        <div className="text-sm text-slate-400 text-center py-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                                            No lessons added to this module yet. Click "Add Lesson" to start building curriculum.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {module.lessons.map((lesson, idx) => (
                                                                <div
                                                                    key={lesson.id}
                                                                    onClick={async () => {
                                                                        setLoadingLesson(true);
                                                                        try {
                                                                            const res = await fetch(`http://localhost:5000/api/student/lessons/${lesson.id}`, {
                                                                                headers: { 'Authorization': `Bearer ${token}` }
                                                                            });
                                                                            if (res.ok) {
                                                                                const data = await res.json();
                                                                                setPreviewLesson({ title: data.title, content: data.content || 'No content available.', type: data.type, duration: data.duration });
                                                                            }
                                                                        } catch { }
                                                                        finally { setLoadingLesson(false); }
                                                                    }}
                                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group/lesson"
                                                                >
                                                                    <div className="flex flex-row items-center gap-4 flex-1">
                                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                                                                            {idx + 1}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h5 className="font-semibold text-slate-900 dark:text-white truncate group-hover/lesson:text-emerald-600 transition-colors">{lesson.title}</h5>
                                                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                                                                <span className="flex items-center gap-1 uppercase tracking-wide">
                                                                                    {lesson.type === 'video' ? <Video size={12} /> : <FileText size={12} />}
                                                                                    {lesson.type}
                                                                                </span>
                                                                                <span>•</span>
                                                                                <span className="flex items-center gap-1">
                                                                                    <Clock size={12} /> {lesson.duration}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 sm:self-center self-end border-t sm:border-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto pt-3 sm:pt-0">
                                                                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mr-2"><Eye size={13} />View</span>
                                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }} className="w-full sm:w-auto px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                                                                            <Trash2 size={16} /> Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )
                            ) : (
                                quizzes.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">No quizzes found. Create one to get started!</div>
                                ) : (
                                    quizzes.map(quiz => (
                                        <div
                                            key={quiz.id}
                                            onClick={() => setPreviewQuiz(quiz)}
                                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm group hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
                                        >
                                            <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <FileText size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700">Quiz</span>
                                                    <span className="text-xs text-slate-400 font-medium">{quiz.learning_modules?.title || 'General Quiz'}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{quiz.description}</p>
                                                {quiz.questions && <p className="text-xs text-indigo-500 font-semibold mt-1">{quiz.questions.length} questions</p>}
                                            </div>
                                            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800/50" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => setPreviewQuiz(quiz)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Create Module Modal */}
                {isModuleModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="text-xl font-bold">Create New Module</h3>
                                <button onClick={() => setIsModuleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateModule} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                    <input required type="text" value={newModule.title} onChange={e => setNewModule({ ...newModule, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea required value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                    <select value={newModule.category} onChange={e => setNewModule({ ...newModule, category: e.target.value })} className="w-full px-4 py-2 border rounded-xl">
                                        <option value="Financial Literacy">Financial Literacy</option>
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                        <option value="Investing">Investing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL (Optional)</label>
                                    <input type="text" value={newModule.imageUrl} onChange={e => setNewModule({ ...newModule, imageUrl: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 mb-4 text-xs text-emerald-700 dark:text-emerald-400">
                                        <Sparkles size={14} className="shrink-0 mt-0.5" />
                                        <span><strong>AI will automatically generate 3 lessons</strong> for this module based on the title and category you chose. Tailored for Senior High School students.</span>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                                        <button type="submit" disabled={isSubmitting || isGeneratingLessons} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-2 min-w-[160px] justify-center">
                                            {isGeneratingLessons ? (
                                                <><Loader2 size={16} className="animate-spin" />Generating AI Lessons...</>
                                            ) : isSubmitting ? (
                                                <><Loader2 size={16} className="animate-spin" />Creating Module...</>
                                            ) : (
                                                <>Create Module</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Lesson Modal */}
                {isLessonModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 text-slate-900 dark:text-white sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <BookOpen size={20} className="text-emerald-500" />
                                    Add New Lesson
                                </h3>
                                <button onClick={() => setIsLessonModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="overflow-y-auto w-full p-6">
                                <form id="create-lesson-form" onSubmit={handleCreateLesson} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Lesson Title</label>
                                            <input required type="text" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. Introduction to Budgeting" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
                                            <textarea required value={newLesson.description} onChange={e => setNewLesson({ ...newLesson, description: e.target.value })} className="w-full px-4 py-2 border rounded-xl" rows={2} placeholder="Brief summary of what this lesson covers..." />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Content Type</label>
                                            <select value={newLesson.type} onChange={e => setNewLesson({ ...newLesson, type: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl">
                                                <option value="article">Article / Text</option>
                                                <option value="video">Video</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Duration</label>
                                            <input required type="text" value={newLesson.duration} onChange={e => setNewLesson({ ...newLesson, duration: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl" placeholder="e.g. 15 min" />
                                        </div>

                                        {newLesson.type === 'video' && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Video Source URL (YouTube, Vimeo, MP4)</label>
                                                <input required type="text" value={newLesson.videoUrl} onChange={e => setNewLesson({ ...newLesson, videoUrl: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl" placeholder="https://..." />
                                            </div>
                                        )}

                                        <div className="sm:col-span-2">
                                            <div className="flex justify-between items-end mb-1">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    Lesson Content (Text/Markdown)
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={handleGenerateAILesson}
                                                    disabled={isGeneratingAILesson || !newLesson.title}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                                                >
                                                    {isGeneratingAILesson ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                    {isGeneratingAILesson ? 'Generating...' : 'Auto-Generate with AI'}
                                                </button>
                                            </div>
                                            <textarea required value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-mono text-sm leading-relaxed" rows={10} placeholder="Write your lesson content here..." />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
                                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                                <button form="create-lesson-form" type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20">
                                    {isSubmitting ? 'Saving Lesson...' : 'Save Lesson'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Create Quiz Modal */}
                {isQuizModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 bg-white dark:bg-slate-900 z-10">
                                <h3 className="text-xl font-bold">Create New Quiz</h3>
                                <button onClick={() => setIsQuizModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateQuiz} className="p-6 space-y-5">
                                {/* Step 1: Pick module — everything auto-generates */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Assign to Module <span className="text-emerald-500 font-normal">(select to auto-generate quiz)</span>
                                    </label>
                                    <select
                                        value={newQuiz.moduleId}
                                        onChange={async e => {
                                            const selectedId = e.target.value;
                                            const selectedModule = modules.find(m => m.id === selectedId);

                                            if (!selectedModule) {
                                                setNewQuiz({ ...newQuiz, moduleId: '', title: '', description: '', questions: [] });
                                                return;
                                            }

                                            // Pre-set title immediately for UX
                                            setNewQuiz({ ...newQuiz, moduleId: selectedId, title: `${selectedModule.title} Quiz`, description: '', questions: [] });

                                            // Auto-generate quiz from lesson content
                                            setIsGeneratingAIQuiz(true);
                                            try {
                                                const res = await fetch('http://localhost:5000/api/ai/generate-module-quiz', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                                    body: JSON.stringify({ moduleId: selectedId, moduleTitle: selectedModule.title })
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    setNewQuiz(prev => ({
                                                        ...prev,
                                                        title: data.title,
                                                        description: data.description,
                                                        questions: data.questions
                                                    }));
                                                } else {
                                                    const err = await res.json();
                                                    alert(`AI Error: ${err.error}`);
                                                }
                                            } catch (err: any) {
                                                alert('Failed to generate quiz. Make sure the server is running.');
                                            } finally {
                                                setIsGeneratingAIQuiz(false);
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 border rounded-xl"
                                    >
                                        <option value="">— Select a Module —</option>
                                        {modules.map(m => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Auto-generated info box */}
                                {isGeneratingAIQuiz ? (
                                    <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                        <Loader2 size={20} className="animate-spin text-indigo-600 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">AI is reading the lessons...</p>
                                            <p className="text-xs text-indigo-500 mt-0.5">Generating 5 SHS quiz questions from lesson content</p>
                                        </div>
                                    </div>
                                ) : newQuiz.questions.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                            <Sparkles size={16} className="text-emerald-600 shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{newQuiz.questions.length} questions generated from lesson content!</p>
                                                <p className="text-xs text-emerald-600/70 dark:text-emerald-500 mt-0.5 font-semibold">{newQuiz.title}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                            {newQuiz.questions.map((q: any, i: number) => (
                                                <div key={i} className="text-xs p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{i + 1}. {q.question}</p>
                                                    <ul className="space-y-0.5">
                                                        {q.options?.map((opt: string, oi: number) => (
                                                            <li key={oi} className={`pl-2 ${oi === q.correctAnswer ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                                                                {oi === q.correctAnswer ? '✓ ' : '○ '}{opt}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : newQuiz.moduleId ? null : (
                                    <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                                        <Sparkles size={14} className="shrink-0 mt-0.5 text-indigo-400" />
                                        Select a module above — the AI will automatically read its lessons and generate 5 quiz questions for SHS students.
                                    </div>
                                )}

                                <div className="pt-2 flex justify-end gap-3">
                                    <button type="button" onClick={() => { setIsQuizModalOpen(false); setNewQuiz({ title: '', description: '', moduleId: '', questions: [] }); }} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || isGeneratingAIQuiz || newQuiz.questions.length === 0}
                                        className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Create Quiz'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>

            {/* Quiz Preview Modal */}
            {
                previewQuiz && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPreviewQuiz(null)}>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700">Quiz Preview</span>
                                        {previewQuiz.learning_modules && <span className="text-xs text-slate-400">{previewQuiz.learning_modules.title}</span>}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{previewQuiz.title}</h3>
                                    {previewQuiz.description && <p className="text-sm text-slate-500 mt-0.5">{previewQuiz.description}</p>}
                                </div>
                                <button onClick={() => setPreviewQuiz(null)} className="text-slate-400 hover:text-slate-600 ml-4 shrink-0"><X size={20} /></button>
                            </div>
                            <div className="overflow-y-auto p-6 space-y-4">
                                {!previewQuiz.questions || previewQuiz.questions.length === 0 ? (
                                    <p className="text-center text-slate-400 py-6">No questions found for this quiz.</p>
                                ) : (
                                    previewQuiz.questions.map((q, i) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="font-bold text-slate-800 dark:text-white mb-3">{i + 1}. {q.text}</p>
                                            <ul className="space-y-2">
                                                {q.options.map((opt, oi) => (
                                                    <li key={oi} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${oi === q.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${oi === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                                            {String.fromCharCode(65 + oi)}
                                                        </span>
                                                        {opt}
                                                        {oi === q.correctAnswer && <span className="ml-auto text-xs font-bold text-emerald-600">✓ Correct</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end">
                                <button onClick={() => setPreviewQuiz(null)} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90">Close</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Lesson Preview Modal */}
            {
                (previewLesson || loadingLesson) && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loadingLesson && setPreviewLesson(null)}>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            {loadingLesson ? (
                                <div className="flex items-center justify-center p-16">
                                    <Loader2 size={32} className="animate-spin text-emerald-500" />
                                </div>
                            ) : previewLesson && (
                                <>
                                    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                                                    {previewLesson && previewLesson.type === 'video' ? <><Video size={10} />Video</> : <><FileText size={10} />Article</>}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} />{previewLesson.duration}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{previewLesson.title}</h3>
                                        </div>
                                        <button onClick={() => setPreviewLesson(null)} className="text-slate-400 hover:text-slate-600 ml-4 shrink-0"><X size={20} /></button>
                                    </div>
                                    <div className="overflow-y-auto p-6">
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {previewLesson.content}
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end">
                                        <button onClick={() => setPreviewLesson(null)} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90">Close</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default FacultyContentPage;
