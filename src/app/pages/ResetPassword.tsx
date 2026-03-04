import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [oobCode, setOobCode] = useState('');

    useEffect(() => {
        // Firebase adds oobCode for password resets to the query string, not the hash.
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('oobCode');

        if (code) {
            setOobCode(code);
        } else {
            // Fallback for custom routing setups, sometimes it appears in the hash depending on the hosting
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const hashCode = hashParams.get('oobCode') || hashParams.get('access_token');
            if (hashCode) setOobCode(hashCode);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        if (!oobCode) {
            alert("Invalid or expired reset link. Please try resetting your password again.");
            return;
        }

        setLoading(true);

        try {
            await confirmPasswordReset(auth, oobCode, password);
            alert('Password updated successfully! Please login.');
            navigate('/login');
        } catch (error: any) {
            console.error('Update password error:', error);
            if (error.code === 'auth/expired-action-code') {
                alert('The reset link has expired. Please request a new one.');
            } else if (error.code === 'auth/invalid-action-code') {
                alert('The reset link is invalid. It may have already been used.');
            } else if (error.code === 'auth/weak-password') {
                alert('Your password is too weak. Please use a stronger password.');
            } else {
                alert(error.message || 'Failed to update password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-900 overflow-hidden relative justify-center items-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 relative z-10 mx-4"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-emerald-500/10 p-4 rounded-full">
                        <Lock size={32} className="text-emerald-500" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Reset Password</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Enter your new password below.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                placeholder="••••••••"
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Update Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
