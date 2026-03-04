import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ProblemSolution: React.FC = () => {
  return (
    <section className="py-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Problem Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-slate-800 p-8 lg:p-12 text-white shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-3xl font-bold mb-6">The Challenge</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 font-mono text-sm">1</span>
                  <p className="text-slate-300">Impulse buying and lack of budgeting skills create unnecessary financial stress.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 font-mono text-sm">2</span>
                  <p className="text-slate-300">Fear that starting a business requires massive capital prevents action.</p>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Solution Card */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="group relative overflow-hidden rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-8 lg:p-12 shadow-xl"
          >
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">The Solution</h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                    <CheckCircle2 size={14} />
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">Gamified learning to build strong money habits instantly.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                    <CheckCircle2 size={14} />
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">Low-capital startup guides that prove you can start small.</p>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                    <CheckCircle2 size={14} />
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">Integration with SDG 8 for sustainable economic growth.</p>
                </li>
              </ul>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
