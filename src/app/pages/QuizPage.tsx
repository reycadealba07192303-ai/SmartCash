import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from './dashboard/DashboardLayout';
import QuizInterface from '../components/QuizInterface';
import { quizzes, Quiz } from '../data/quizData';
import { ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const QuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();

    // State for AI Quiz Generation
    const [searchParams] = useSearchParams();
    const initialTopic = searchParams.get('topic') || '';
    const [isAiMode, setIsAiMode] = useState(quizId === 'ai-generated' || !!initialTopic);
    const [aiTopic, setAiTopic] = useState(initialTopic);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
    const [fetchedQuiz, setFetchedQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(!isAiMode && Boolean(quizId) && quizId !== 'ai-generated');
    const { token } = useAuth();

    useEffect(() => {
        if (isAiMode || !quizId || quizId === 'ai-generated') {
            setIsLoading(false);
            return;
        }

        const fetchQuiz = async () => {
            if (!token) return;
            try {
                const res = await fetch(`https://smartcash-eudv.onrender.com/api/student/quizzes/${quizId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch quiz');

                const data = await res.json();

                // Map backend structure to frontend structure
                const newQuiz: Quiz = {
                    id: data.id,
                    title: data.title,
                    description: data.description || 'Test your knowledge on this topic!',
                    category: data.category || 'General',
                    questions: (data.questions || []).map((q: any, i: number) => ({
                        id: i + 1,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || `The correct answer is ${q.options[q.correctAnswer]}.`
                    }))
                };
                setFetchedQuiz(newQuiz);
            } catch (error) {
                console.error('Fetch Quiz Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId, isAiMode, token]);

    // Determine which quiz to show
    const activeQuiz = isAiMode ? generatedQuiz : fetchedQuiz;

    const handleGenerateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiTopic || !token) return;

        setIsGenerating(true);

        try {
            const res = await fetch('https://smartcash-eudv.onrender.com/api/ai/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // Backend aiService.tsx generateQuizQuestions expects 'lessonContent'. We can pass the topic.
                body: JSON.stringify({ lessonContent: aiTopic, numQuestions: 5 })
            });

            if (!res.ok) throw new Error('Failed to generate quiz');

            const data = await res.json();

            // Format the response into our frontend Quiz structure
            const newQuiz: Quiz = {
                id: `ai-${Date.now()}`,
                title: `AI Quiz: ${aiTopic}`,
                description: `A generated quiz to test your knowledge on ${aiTopic}.`,
                category: 'Innovation',
                questions: data.questions.map((q: any, index: number) => ({
                    id: index + 1,
                    text: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation || `The correct answer is ${q.options[q.correctAnswer]}.`
                }))
            };

            setGeneratedQuiz(newQuiz);
        } catch (error) {
            console.error('AI Quiz Error:', error);
            alert('Could not generate quiz. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                </div>
            </DashboardLayout>
        );
    }

    if (!activeQuiz && !isAiMode) {
        return (
            <DashboardLayout role="student">
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Quiz Not Found</h2>
                    <p className="text-slate-500 mb-6">The quiz you are looking for does not exist.</p>
                    <Link to="/dashboard/student" className="text-emerald-600 font-bold hover:underline">
                        Back to Dashboard
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium">
                        <ChevronLeft size={20} />
                        Back to Dashboard
                    </Link>


                </div>

                {isAiMode && !generatedQuiz ? (
                    <div className="max-w-xl mx-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-xl">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-purple-500/30">
                                <Sparkles size={32} />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Quiz Generator</h1>
                            <p className="text-slate-500 dark:text-slate-400">Enter a topic and let Gemini AI create a unique quiz for you.</p>
                        </div>

                        <form onSubmit={handleGenerateQuiz} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Topic
                                </label>
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="e.g., Investment Strategies, Crypto Basics..."
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/25 hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Generating Questions...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Generate Quiz
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    activeQuiz && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{activeQuiz.title}</h1>
                                <p className="text-slate-500 dark:text-slate-400">{activeQuiz.description}</p>
                            </div>
                            <QuizInterface quiz={activeQuiz} />
                        </>
                    )
                )}
            </div>
        </DashboardLayout>
    );
};

export default QuizPage;
