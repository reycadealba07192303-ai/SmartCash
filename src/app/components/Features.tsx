import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Rocket, Smartphone, Leaf, ArrowUpRight } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Power-Packed Modules</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to go from financial novice to money master.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Card 1 */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Financial Literacy</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                Master the basics of budgeting, saving, and investing. Use our interactive calculators to visualize your wealth growth over time.
              </p>
              <button className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Start Module <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Tall Card 2 */}
          <div className="md:row-span-2 bg-slate-900 dark:bg-emerald-950 rounded-3xl p-8 border border-slate-800 dark:border-emerald-900 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                  <Leaf size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Sustainable Finance</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Learn how responsible money choices support SDG 8. Discover green business ideas that help the planet while you earn.
                </p>
              </div>
              <div className="mt-auto">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <p className="text-xs text-slate-400 mb-1">Impact Goal</p>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 w-[75%] h-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 mb-6">
              <Rocket size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Entrepreneurship</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Launch with low capital. Get templates for business plans and marketing strategies.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 mb-6">
              <Smartphone size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Innovation & Tech</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Use social media algorithms and digital tools to scale your side hustle fast.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
