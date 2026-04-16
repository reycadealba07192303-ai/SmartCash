import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const Subscriptions = () => {
  const [isYearly, setIsYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <section id="pricing" className="relative px-4 sm:px-6 w-full max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          Choose Your Plan
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          We adopt a freemium strategy to ensure accessibility for every student while offering optional advanced tools to deepen your financial knowledge.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 text-sm md:text-base">
          <span className={!isYearly ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-800 relative flex items-center p-1 transition-colors border border-slate-300 dark:border-slate-700 focus:outline-none"
          >
            <div
              className={`w-5 h-5 rounded-full bg-emerald-500 transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`}
            ></div>
          </button>
          <span className={isYearly ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}>Yearly</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {/* Basic Card */}
        <div className="border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 transition-transform hover:-translate-y-1 shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Basic</h3>
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6"></div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-start">
            Free
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">Forever</p>

          <ul className="space-y-4 mb-8 text-slate-600 dark:text-slate-300 text-sm flex-1">
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Basic budgeting tools</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Expense tracking</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Introductory financial literacy content</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Accessible without financial barriers</li>
          </ul>

          <button 
            onClick={() => navigate('/register')}
            className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Get Started
          </button>
        </div>

        {/* Premium Card */}
        <div className="border-2 border-emerald-500 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl shadow-emerald-500/10 relative transform transition-transform hover:-translate-y-1 z-10 flex flex-col h-full">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg tracking-wider">
            Premium
          </div>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Advanced</h3>
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mb-6"></div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-start">
            <span className="text-xl mt-1 mr-1 text-slate-500 dark:text-slate-400 font-medium">₱</span>
            {isYearly ? "490" : "49"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">per {isYearly ? 'year' : 'month'}</p>

          <ul className="space-y-4 mb-8 text-slate-600 dark:text-slate-300 text-sm flex-1">
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> All Basic features</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Advanced analytics</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Personalized financial insights</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Downloadable reports</li>
            <li className="flex items-start gap-3"><Check className="text-emerald-500 shrink-0 w-5 h-5" /> Goal forecasting tools</li>
          </ul>

          <button 
            onClick={() => navigate(`/checkout?plan=premium&billing=${isYearly ? 'yearly' : 'monthly'}`)}
            className="w-full py-4 mt-auto rounded-xl border border-emerald-500 bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Get Premium
          </button>
        </div>

      </div>
    </section>
  );
};

export default Subscriptions;
