import React from 'react';
import { Leaf } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 pt-20 pb-10 border-t border-slate-200 dark:border-slate-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="SmartCash Logo" className="h-8 w-auto" />
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                Smart<span className="text-emerald-500">Cash</span>
              </span>
            </a>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              Empowering the next generation of entrepreneurs at STI College Malolos through interactive financial literacy modules, real-time budget tracking, and AI-driven insights.
            </p>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/#features" className="hover:text-emerald-500 transition-colors">Features</a></li>
              <li><a href="/#how-it-works" className="hover:text-emerald-500 transition-colors">How It Works</a></li>
              <li><a href="/#testimonials" className="hover:text-emerald-500 transition-colors">Testimonials</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="/#about" className="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="/privacy-policy" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 SmartCash. Built for STI College Malolos.</p>
          <div className="flex gap-8">
            <a href="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="/cookies" className="hover:text-slate-900 dark:hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
