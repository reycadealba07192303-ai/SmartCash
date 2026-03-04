import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, PlayCircle, TrendingUp, ShieldCheck, Users } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-10 lg:pt-48 overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-emerald-500/10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-purple-500/10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-blue-500/10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center mb-16 lg:mb-24">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">New: Entrepreneurship Module v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl"
          >
            Master Money. <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">Build Your Future.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed"
          >
            The all-in-one financial literacy platform for ABM students. Learn budgeting, start a business, and understand sustainable finance—totally free.
          </motion.p>

          <div className="mb-4"></div>
        </div>

        {/* Dashboard Preview / Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur opacity-20 dark:opacity-40"></div>
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[2/1]">

            {/* Mock UI Header */}
            <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Mock UI Content */}
            <div className="p-8 grid grid-cols-3 gap-8 h-full bg-slate-50/50 dark:bg-slate-900/50">
              {/* Left Column: Sidebar & Stats */}
              <div className="col-span-1 space-y-6 hidden md:block">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Total Savings</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">₱12,450.00</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold mb-4 text-slate-800 dark:text-slate-200">Recent Modules</p>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex-shrink-0"></div>
                        <div className="h-2 w-20 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area: Chart & Dashboard */}
              <div className="col-span-3 md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg shadow-emerald-500/30">
                      <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Financial Freedom Unlocked</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Track your budget, learn from experts, and grow your business ideas.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Floating Badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-8 top-20 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden lg:flex items-center gap-3 z-20"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Active Students</p>
              <p className="text-xs text-slate-500">+1,200 joined</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
