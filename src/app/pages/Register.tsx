import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Loader2, ArrowLeft, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ThemeToggle from '../components/ThemeToggle';
import { API_BASE } from '../../config/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    schoolId: '',
    gradeLevel: '',
    strand: ''
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on change
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white dark:bg-slate-900 overflow-hidden relative">

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-emerald-100 dark:border-emerald-900"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Successful!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Welcome to SmartCash! Your account has been created and verified. You can now login.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Proceed to Login
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors backdrop-blur-sm"
      >
        <ArrowLeft size={24} />
      </motion.button>

      <div className="absolute top-6 right-16 z-50 md:right-24">
        <ThemeToggle />
      </div>

      {/* Left Side - Decorative/Action (Fixed) */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="hidden md:flex w-5/12 h-full bg-gradient-to-br from-emerald-800 to-teal-900 relative overflow-hidden flex-col items-center justify-center p-12 text-center text-white z-10"
      >
        {/* Background pattern/gradient */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center max-w-lg">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-3xl mb-8 shadow-2xl shadow-emerald-900/30 transform hover:scale-105 transition-transform duration-500 border border-white/5"
          >
            <Leaf size={64} className="text-white" fill="currentColor" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Welcome Back!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-emerald-100 mb-8 text-lg leading-relaxed max-w-sm"
          >
            To keep connected with us please login with your personal info
          </motion.p>

          <Link to="/login">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: 0.7 }}
              className="px-12 py-3.5 rounded-full border border-white/40 hover:bg-white hover:text-emerald-900 font-bold transition-all backdrop-blur-sm text-lg shadow-xl uppercase tracking-wide"
            >
              Sign In
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Right Side - Form Area (Scrollable) */}
      <div className="w-full md:w-7/12 h-full overflow-y-auto bg-white dark:bg-slate-900 flex flex-col relative z-0 scrollbar-hide">
        <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-16">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Create Account
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

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">School ID</label>
                  <input
                    name="schoolId"
                    type="text"
                    value={formData.schoolId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    placeholder="2023-12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <input
                    name="email"
                    type="text"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    placeholder="student@sti.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Faculty</option>
                </select>
                <div className="absolute top-[38px] right-4 pointer-events-none text-slate-500 dark:text-slate-400">
                  <ChevronDown size={20} />
                </div>
              </div>

              {formData.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade / Year</label>
                      <select
                        name="gradeLevel"
                        value={formData.gradeLevel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Select Level</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                      </select>
                      <div className="absolute top-[38px] right-4 pointer-events-none text-slate-500 dark:text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Strand / Course</label>
                      <select
                        name="strand"
                        value={formData.strand}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all font-medium appearance-none"
                      >
                        <option value="">Select Strand</option>
                        <option value="STEM">STEM</option>
                        <option value="ABM">ABM</option>
                        <option value="HUMSS">HUMSS</option>
                        <option value="GAS">GAS</option>
                        <option value="TVL">TVL</option>
                      </select>
                      <div className="absolute top-[38px] right-4 pointer-events-none text-slate-500 dark:text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                </>
              )}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-full uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] transform duration-200"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : 'Sign Up'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center md:hidden">
              <p className="text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
