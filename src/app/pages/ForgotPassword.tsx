import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import ThemeToggle from '../components/ThemeToggle';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setSubmitted(true);
        } catch (error: any) {
            console.error('Forgot password error:', error);
            // Firebase returns specific error codes, providing user-friendly messages for common ones
            if (error.code === 'auth/user-not-found') {
                alert('No account found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Invalid email address format.');
            } else {
                alert('An error occurred. Please try again later.');
            }
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
                onClick={() => navigate('/login')}
                className="absolute top-6 left-6 z-50 p-2 rounded-full bg-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors backdrop-blur-sm border border-slate-200 dark:border-slate-700 md:left-6 left-4"
            >
                <ArrowLeft size={24} />
            </motion.button>

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
                            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
                                <Leaf size={24} fill="currentColor" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                                Smart<span className="text-emerald-500">Cash</span>
                            </span>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                                Forgot Password?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                {submitted
                                    ? "Check your email for reset instructions."
                                    : "Enter your email address to enable us to send you a password reset link."
                                }
                            </p>
                        </div>

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                        placeholder="student@sti.edu"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-lg uppercase tracking-wider"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>

                                <div className="text-center mt-6">
                                    <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500 flex items-center justify-center gap-2">
                                        <ArrowLeft size={16} /> Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                                        We have sent a password reset link to <span className="font-bold">{email}</span>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-emerald-600 hover:text-emerald-500 font-medium"
                                >
                                    Didn't receive the email? Try again
                                </button>
                                <div className="pt-4">
                                    <Link to="/login" className="w-full block bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-4 rounded-full transition-all text-lg uppercase tracking-wider">
                                        Back to Log In
                                    </Link>
                                </div>
                            </div>
                        )}
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
                        <Leaf size={64} className="text-emerald-400" fill="currentColor" />
                    </motion.div>

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Password Recovery
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-emerald-100 mb-8 text-lg leading-relaxed max-w-sm"
                    >
                        Don't worry, it happens to the best of us. We'll verify your email and send you a link to reset your password.
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
