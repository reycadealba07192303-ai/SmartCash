import React, { useState } from 'react';
import { BookOpen, TrendingUp, Award, Wallet, BarChart2, ChevronRight, CheckCircle2, PlayCircle, X } from 'lucide-react';

const AboutSystem: React.FC = () => {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <section id="about" className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                {/* ── LEFT COLUMN ── */}
                <div className="flex-1">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                        <Wallet size={28} />
                    </div>

                    {/* Title + badge */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                            Built for{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                                smarter
                            </span>{' '}
                            students.
                        </h2>
                        <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase tracking-widest animate-pulse">
                            Free Access
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-4">
                        SmartCash is a <strong className="text-slate-700 dark:text-slate-300">Financial Literacy Learning Management System</strong> built
                        for Senior High School ABM students. It turns abstract financial concepts into
                        practical skills — through guided lessons, real budget tracking, and AI-powered insights.
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
                        Whether you're learning to save for the first time or preparing for entrepreneurship,
                        SmartCash gives you the tools and the knowledge to take control of your financial future.
                    </p>

                    {/* Key points */}
                    <ul className="flex flex-col gap-3 mb-10">
                        {[
                            'Interactive modules on budgeting, saving & investing',
                            'Real-time income & expense tracker',
                            'Earn certificates after completing quizzes',
                            'AI-generated financial tips based on your habits',
                        ].map((point) => (
                            <li key={point} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                {point}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <button
                        onClick={() => setShowDemo(true)}
                        className="inline-flex items-center gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-full font-bold text-base hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg group w-fit"
                    >
                        <PlayCircle size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        Watch Demo
                    </button>
                </div>

                {/* ── RIGHT COLUMN — Floating UI Mockup ── */}
                <div className="flex-1 relative flex justify-center items-center min-h-[420px]">
                    {/* Background blob */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl" />

                    {/* Main card: Dashboard preview */}
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Monthly Overview</p>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">Budget Tracker</h4>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                <BarChart2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>

                        {/* Progress bars */}
                        {[
                            { label: 'Food & Dining', pct: 62, color: 'bg-emerald-500', amount: '₱1,240' },
                            { label: 'Transportation', pct: 35, color: 'bg-blue-500', amount: '₱700' },
                            { label: 'Savings Goal', pct: 80, color: 'bg-teal-500', amount: '₱4,000' },
                        ].map((item) => (
                            <div key={item.label} className="mb-4">
                                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                    <span>{item.label}</span>
                                    <span>{item.amount}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}

                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                            <span className="text-slate-400">Total Spent this month</span>
                            <span className="font-black text-slate-900 dark:text-white">₱5,840</span>
                        </div>
                    </div>

                    {/* Floating badge: Modules */}
                    <div className="absolute top-6 -left-4 z-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">3 Modules</p>
                            <p className="text-[10px] text-slate-400">Financial · Investing · Business</p>
                        </div>
                    </div>

                    {/* Floating badge: Certificate earned */}
                    <div className="absolute bottom-6 -right-4 z-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                            <Award size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Certificate Earned!</p>
                            <p className="text-[10px] text-slate-400">Budgeting Basics · Mar 2025</p>
                        </div>
                    </div>

                    {/* Floating badge: Streak */}
                    <div className="absolute -bottom-3 left-8 z-20 bg-emerald-600 rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2">
                        <TrendingUp size={14} className="text-white" />
                        <div>
                            <p className="text-xs font-bold text-white">Savings up 24%</p>
                            <p className="text-[10px] text-white/70">vs last month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Demo Modal */}
            {showDemo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setShowDemo(false)}
                >
                    <div
                        className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video ring-1 ring-white/20 animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowDemo(false)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/aRcXutXvfmM?autoplay=1"
                            title="SmartCash Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AboutSystem;
