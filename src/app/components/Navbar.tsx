import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Leaf, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's the home link, we let it route normally OR scroll to top if already on home
    if (href === '/') {
      if (window.location.pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsOpen(false);
      return;
    }

    // Handle hash links (like /#about)
    if (href.startsWith('/#')) {
      // If we're not on the home page, just let it navigate to the right page/hash
      if (window.location.pathname !== '/') return;

      e.preventDefault();
      const targetId = href.replace('/#', '');
      const element = document.getElementById(targetId);
      if (element) {
        const navHeight = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - navHeight,
          behavior: 'smooth'
        });
      }
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full max-w-5xl rounded-full transition-all duration-300 border ${scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-black/20 py-3 px-6'
          : 'bg-transparent border-transparent py-4 px-4'
          }`}
      >
        <div className="flex justify-between items-center">
          <a href="#" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="SmartCash Logo" className="h-8 w-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Smart<span className="text-emerald-500">Cash</span>
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {['Home', 'About', 'Features', 'How It Works', 'Testimonials'].map((item) => {
              const href = item === 'Home' ? '/' : `/#${item.toLowerCase().replace(/\s/g, '-')}`;
              return (
                <a
                  key={item}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {item}
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate('/register')}
              className="bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-emerald-500/20"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="p-2 text-slate-900 dark:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-20 left-4 right-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 md:hidden z-40 origin-top"
          >
            <div className="flex flex-col gap-2">
              {['Home', 'About', 'Features', 'How It Works', 'Testimonials'].map((item) => {
                const href = item === 'Home' ? '/' : `/#${item.toLowerCase().replace(/\s/g, '-')}`;
                return (
                  <a
                    key={item}
                    href={href}
                    onClick={(e) => handleNavClick(e, href)}
                    className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    {item}
                  </a>
                );
              })}

              <button onClick={() => navigate('/register')} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-emerald-500/20">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
