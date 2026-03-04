import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, BookOpenCheck, Trophy } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="w-5 h-5" />,
    title: "Sign Up",
    description: "Quickly register as an ABM student."
  },
  {
    icon: <BookOpenCheck className="w-5 h-5" />,
    title: "Learn & Practice",
    description: "Complete interactive modules & quizzes."
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Apply & Grow",
    description: "Submit ideas, track progress, earn badges."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              We've simplified the path to financial freedom into three actionable steps designed for your busy student life.
            </p>
            <button className="mt-8 text-emerald-600 font-bold hover:text-emerald-700 underline decoration-2 underline-offset-4">
              Get Started Now
            </button>
          </div>

          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            {/* Connecting Line */}
            <div className="hidden sm:block absolute top-8 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>

            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative"
              >
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mb-4 mx-auto sm:mx-0 border-4 border-white dark:border-slate-800">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center sm:text-left">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
