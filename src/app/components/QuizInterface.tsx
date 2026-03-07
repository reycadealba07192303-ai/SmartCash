import React, { useState } from 'react';
import { ChevronRight, RefreshCcw, CheckCircle, XCircle, Award, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Quiz } from '../data/quizData';
import { useAuth } from '../../context/AuthContext';

interface QuizInterfaceProps {
    quiz: Quiz;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [givenAnswers, setGivenAnswers] = useState<number[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const { token, user } = useAuth();

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    const handleOptionSelect = (index: number) => {
        if (showExplanation) return; // Prevent changing answer after submission
        setSelectedOption(index);
    };

    const checkAnswer = () => {
        setShowExplanation(true);
        const currentAns = selectedOption !== null ? selectedOption : -1;
        setGivenAnswers(prev => {
            const newAns = [...prev];
            newAns[currentQuestionIndex] = currentAns;
            return newAns;
        });

        if (selectedOption === currentQuestion.correctAnswer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = async () => {
        if (isLastQuestion) {
            // `score` is already updated by `checkAnswer` when the user clicked "Check Answer".
            // We just need to use `score` as the final score.
            setFinalScore(score);
            setIsCompleted(true);

            // Persist quiz completion in localStorage so My Modules page can read it
            if (quiz.id) {
                const prev = JSON.parse(localStorage.getItem('completedQuizIds') || '[]');
                if (!prev.includes(quiz.id)) {
                    localStorage.setItem('completedQuizIds', JSON.stringify([...prev, quiz.id]));
                }
            }

            if (token) {
                try {
                    await fetch('http://localhost:5000/api/student/quizzes/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            quizId: quiz.id,
                            quizTitle: quiz.title,
                            score: score,
                            total: quiz.questions.length,
                            answers: givenAnswers,
                            questions: quiz.questions.map(q => ({
                                text: q.text,
                                options: q.options,
                                correctAnswer: q.correctAnswer
                            }))
                        })
                    });
                } catch (err) {
                    console.error('Failed to submit quiz result', err);
                }
            }
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        }
    };

    const retryQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowExplanation(false);
        setScore(0);
        setGivenAnswers([]);
        setFinalScore(0);
        setIsCompleted(false);
    };

    const downloadCertificate = () => {
        const W = 1123, H = 794;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d')!;

        // Background
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#1e293b');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

        // Gold borders
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 6;
        ctx.strokeRect(28, 28, W - 56, H - 56);
        ctx.strokeStyle = 'rgba(212,175,55,0.4)'; ctx.lineWidth = 2;
        ctx.strokeRect(42, 42, W - 84, H - 84);

        // Corner ornaments
        const orn = (x: number, y: number) => {
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3;
            [14, 22].forEach(r => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); });
        };
        orn(28, 28); orn(W - 28, 28); orn(28, H - 28); orn(W - 28, H - 28);

        // Divider gradient helper
        const divGrad = () => {
            const g = ctx.createLinearGradient(160, 0, W - 160, 0);
            g.addColorStop(0, 'transparent'); g.addColorStop(0.5, '#d4af37'); g.addColorStop(1, 'transparent');
            return g;
        };

        // Header
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981'; ctx.font = 'bold 22px sans-serif'; ctx.letterSpacing = '6px';
        ctx.fillText('SMARTCASH', W / 2, 100);
        ctx.fillStyle = 'rgba(100,116,139,0.8)'; ctx.font = '13px sans-serif'; ctx.letterSpacing = '3px';
        ctx.fillText('FINANCIAL LITERACY PLATFORM', W / 2, 124);

        ctx.strokeStyle = divGrad(); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(160, 140); ctx.lineTo(W - 160, 140); ctx.stroke();

        ctx.fillStyle = 'rgba(212,175,55,0.85)'; ctx.font = 'italic 18px Georgia,serif'; ctx.letterSpacing = '2px';
        ctx.fillText('Certificate of Completion', W / 2, 178);

        ctx.fillStyle = 'rgba(148,163,184,0.9)'; ctx.font = '15px sans-serif'; ctx.letterSpacing = '0px';
        ctx.fillText('This is to certify that', W / 2, 218);

        // Student name
        const name = (user?.fullName || user?.full_name || user?.email || 'Student').toUpperCase();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 52px Georgia,serif';
        ctx.fillText(name, W / 2, 296);
        const nw = ctx.measureText(name).width;
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(W / 2 - nw / 2, 308); ctx.lineTo(W / 2 + nw / 2, 308); ctx.stroke();

        ctx.fillStyle = 'rgba(148,163,184,0.9)'; ctx.font = '15px sans-serif';
        ctx.fillText('has successfully completed the quiz', W / 2, 350);

        // Quiz title
        ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 36px Georgia,serif';
        ctx.fillText(`"${quiz.title}"`, W / 2, 403);

        // Score
        const pct = Math.round((finalScore / quiz.questions.length) * 100);
        ctx.fillStyle = pct >= 70 ? '#10b981' : '#f59e0b';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`Score: ${finalScore}/${quiz.questions.length} (${pct}%)`, W / 2, 445);

        ctx.strokeStyle = divGrad(); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(160, H - 140); ctx.lineTo(W - 160, H - 140); ctx.stroke();

        const dateStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillStyle = 'rgba(100,116,139,0.8)'; ctx.font = '13px sans-serif';
        ctx.fillText(`Awarded on ${dateStr}`, W / 2, H - 110);

        // Seal
        ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(W / 2, H - 65, 24, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px sans-serif'; ctx.letterSpacing = '1px';
        ctx.fillText('VERIFIED', W / 2, H - 60);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `Certificate_${quiz.title.replace(/\s+/g, '_')}.png`;
        a.click();
    };

    if (isCompleted) {
        const percentage = Math.round((finalScore / quiz.questions.length) * 100);

        return (
            <div className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-xl text-center">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                    <Award size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">You have successfully finished the <span className="font-semibold text-slate-700 dark:text-slate-200">{quiz.title}</span> quiz.</p>

                <div className="flex justify-center gap-8 mb-8">
                    <div className="text-center">
                        <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{finalScore}/{quiz.questions.length}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-4xl font-extrabold ${percentage >= 70 ? 'text-emerald-500' : 'text-orange-500'}`}>{percentage}%</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</p>
                    </div>
                </div>

                {/* Certificate message */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-2xl">
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold mb-1">🎓 Your certificate is ready!</p>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80">Download your personalized certificate of completion below.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={downloadCertificate}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors shadow-lg shadow-amber-500/20"
                    >
                        <Download size={18} />
                        Download Certificate
                    </button>
                    <button
                        onClick={retryQuiz}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCcw size={18} />
                        Retry Quiz
                    </button>
                    <Link
                        to="/dashboard/student"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                    <span>{Math.round(((currentQuestionIndex) / quiz.questions.length) * 100)}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-xl">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    {currentQuestion.text}
                </h2>

                <div className="space-y-3 mb-8">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const isCorrect = index === currentQuestion.correctAnswer;
                        const showCorrectness = showExplanation;

                        let buttonStyle = "border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                        let icon = null;

                        if (showCorrectness) {
                            if (isCorrect) {
                                buttonStyle = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                icon = <CheckCircle size={20} className="text-emerald-500" />;
                            } else if (isSelected) {
                                buttonStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400";
                                icon = <XCircle size={20} className="text-red-500" />;
                            } else {
                                buttonStyle = "border-slate-200 dark:border-slate-700 opacity-50";
                            }
                        } else if (isSelected) {
                            buttonStyle = "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/10";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={showExplanation}
                                className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-200 flex items-center justify-between ${buttonStyle}`}
                            >
                                <span>{option}</span>
                                {icon}
                            </button>
                        );
                    })}
                </div>

                {showExplanation && (
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm border border-blue-100 dark:border-blue-900/30">
                        <span className="font-bold block mb-1">Explanation:</span>
                        {currentQuestion.explanation}
                    </div>
                )}

                <div className="flex justify-end">
                    {!showExplanation ? (
                        <button
                            onClick={checkAnswer}
                            disabled={selectedOption === null}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizInterface;
