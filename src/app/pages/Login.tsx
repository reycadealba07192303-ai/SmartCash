import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Loader2, ArrowRight, ArrowLeft, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Facebook, Twitter, Linkedin, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Wake up the Render backend as early as possible
  useEffect(() => {
    fetch(`${API_BASE}/api/health`).catch(() => {
      // Ignore errors; this is just a wake-up call
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Login successful - Update Context
      login(data.token, data.user);

      // Redirect based on role
      const role = data.user.role;
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else if (role === 'teacher') {
        navigate('/dashboard/faculty');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white dark:bg-slate-900 overflow-hidden relative">

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 p-2 rounded-full bg-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors backdrop-blur-sm border border-slate-200 dark:border-slate-700 md:left-6 left-4"
      >
        <ArrowLeft size={24} />
      </motion.button>

      <ThemeToggle className="absolute top-6 right-6" />

      {/* Left Side - Form Area (Scrollable) */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-900 flex flex-col relative z-0 scrollbar-hide">
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto w-full"
          >
            <div className="flex items-center gap-2 mb-8 md:hidden">
              <Leaf className="h-8 w-8 text-emerald-500" />
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                Smart<span className="text-emerald-500">Cash</span>
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                Sign In
              </h2>


            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
              >
                <XCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  placeholder="student@sti.edu"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-slate-600 dark:text-slate-400">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-lg uppercase tracking-wider"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center md:hidden">
              <p className="text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500">
                  Sign Up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Decorative/Action (Fixed) */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="hidden md:flex w-1/2 h-full bg-gradient-to-br from-emerald-800 to-teal-900 relative overflow-hidden flex-col items-center justify-center p-12 text-center text-white z-10"
      >
        {/* Background pattern/gradient */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-3xl mb-8 shadow-2xl shadow-emerald-900/30 transform hover:scale-105 transition-transform duration-500 border border-white/5"
          >
            <Leaf size={80} className="text-white drop-shadow-lg" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            New Here?
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-emerald-100 mb-8 text-lg leading-relaxed max-w-sm"
          >
            Sign up and discover a great amount of new opportunities! Join our community today.
          </motion.p>

          <Link to="/register">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.7 }}
              className="px-12 py-3.5 rounded-full border border-white/40 hover:bg-white hover:text-emerald-900 font-bold transition-all backdrop-blur-sm text-lg shadow-xl uppercase tracking-wide"
            >
              Sign Up
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
