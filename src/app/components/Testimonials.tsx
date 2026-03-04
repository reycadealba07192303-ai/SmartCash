import React from 'react';
import { Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-16">Trusted by STI Students</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              text: "This platform changed how I view money. I used to spend my allowance immediately, but now I'm saving 30% every week.",
              author: "Maria Santos",
              role: "Grade 11 ABM",
              img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=100&h=100"
            },
            {
              text: "The entrepreneurship modules are legit. I followed the guide and actually started selling my baked goods on Instagram!",
              author: "John Doe",
              role: "Grade 12 ABM",
              img: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=100&h=100"
            }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="flex gap-1 mb-6 text-emerald-500">
                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-300 font-medium mb-8 leading-relaxed">"{item.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                  <ImageWithFallback src={item.img} alt={item.author} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{item.author}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Research Banner */}
        <div className="mt-20 rounded-3xl bg-slate-900 dark:bg-emerald-950 p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Back by Research</h3>
            <p className="text-slate-300 mb-8">
              "Lack of financial knowledge leads to stress & poor decisions" (Klapper & Lusardi, 2020). 
              We are here to change that narrative for every STI student.
            </p>
            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold transition-colors">
              Join the Movement
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
