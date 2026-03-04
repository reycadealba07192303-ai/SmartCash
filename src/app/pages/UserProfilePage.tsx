import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './dashboard/DashboardLayout';
import { Save, User, Mail, Camera, Shield, Menu, X, Lock, Check, AlertTriangle, Eye, EyeOff, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserProfilePageProps {
    role: 'student' | 'teacher' | 'admin';
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ role }) => {
    const { token, user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    // Initial State with some safety defaults
    const [profile, setProfile] = useState({
        fullName: authUser?.fullName || 'User',
        email: authUser?.email || '',
        role: role,
        gradeSection: 'Loading...',
        avatar: 'https://ui-avatars.com/api/?name=' + (authUser?.fullName || 'User') + '&background=random'
    });

    const [loading, setLoading] = useState(true);

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfile(prev => ({
                        ...prev,
                        fullName: data.full_name || prev.fullName,
                        email: data.email || prev.email,
                        role: data.role || role,
                        gradeSection: data.grade_level ? `${data.grade_level} - ${data.strand}` : 'N/A',
                        avatar: data.avatar_url || prev.avatar
                    }));
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token, role]);

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Password Modal States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState(1);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Delete Account States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePass, setShowDeletePass] = useState(false);

    // Handlers
    const handleSaveProfile = () => {
        setIsEditing(false);
        // Add save logic here (API call to update profile)
        alert("Make sure to implement the save API call!");
    };

    const handlePasswordSave = () => {
        // Add password save logic here (mock)
        setShowPasswordModal(false);
        setPasswordStep(1);
        setPasswords({ current: '', new: '', confirm: '' });
        setShowSuccessModal(true);
    };

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (isDeleting) return;
        setIsDeleting(true);
        try {
            const res = await fetch('http://localhost:5000/api/student/account', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                logout();
                navigate('/');
            } else {
                const data = await res.json();
                alert('Failed to delete account: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Network error. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout role={role}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Account Information</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your profile details and security settings.</p>
                </header>

                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm relative">
                    {/* Header with Hamburger */}
                    <div className="flex items-start justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <User size={20} className="text-slate-400" />
                            Personal Information
                        </h3>

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Menu size={20} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button
                                            onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                        >
                                            <Edit2 size={16} />
                                            Edit Information
                                        </button>
                                        <button
                                            onClick={() => { setShowPasswordModal(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                        >
                                            <Lock size={16} />
                                            Change Password
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                        <button
                                            onClick={() => { setShowDeleteModal(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete Account
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors">
                                        <Camera size={16} />
                                    </button>
                                )}
                            </div>
                            {isEditing && (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Profile Photo</p>
                                    <p className="text-xs text-slate-500">JPG, GIF or PNG. Max 1MB.</p>
                                </div>
                            )}
                        </div>

                        {/* Fields */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profile.fullName}
                                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        />
                                    ) : (
                                        <p className="text-lg font-bold text-slate-900 dark:text-white py-2">{profile.fullName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Email Address</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        />
                                    ) : (
                                        <p className="text-lg font-bold text-slate-900 dark:text-white py-2">{profile.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Role</label>
                                    <div className="flex items-center gap-2 py-2">
                                        <Shield size={16} className="text-emerald-500" />
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{profile.role}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 dark:text-slate-400">Section / Department</label>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white py-2">{profile.gradeSection}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all hover:translate-y-[-2px]"
                                >
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
                            <button
                                onClick={() => { setShowPasswordModal(false); setPasswordStep(1); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Steps Indicator */}
                            <div className="flex items-center gap-2 mb-8">
                                <div className={`flex-1 h-2 rounded-full transition-all ${passwordStep >= 1 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                                <div className={`flex-1 h-2 rounded-full transition-all ${passwordStep >= 2 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
                            </div>

                            {passwordStep === 1 ? (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                            <Lock size={32} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Verify it's you</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Please enter your current password to continue.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPass.current ? "text" : "password"}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setPasswordStep(2)}
                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                                    >
                                        Verify & Continue
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex gap-4">
                                        <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={24} />
                                        <div>
                                            <h5 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Security Alert</h5>
                                            <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1 leading-relaxed">
                                                For your security, you will receive a confirmation email to verify this password change. Please check your inbox after saving.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPass.new ? "text" : "password"}
                                                    value={passwords.new}
                                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPass.confirm ? "text" : "password"}
                                                    value={passwords.confirm}
                                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                                    placeholder="Retype new password"
                                                />
                                                <button
                                                    onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePasswordSave}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Save New Password
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} className="text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Success!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                            Password updated successfully! Please check your email for confirmation.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all hover:translate-y-[-2px]"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                                <AlertTriangle size={24} />
                                Delete Account
                            </h3>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteStep(1); setDeleteConfirm(false); setDeleteConfirmationText(''); setDeletePassword(''); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            {deleteStep === 1 && (
                                <div className="space-y-6">
                                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20 text-center">
                                        <p className="text-red-800 dark:text-red-200 font-bold text-lg mb-2">Warning: Permanent Action</p>
                                        <p className="text-red-600 dark:text-red-300/80 text-sm leading-relaxed">
                                            Deleting your account will permanently remove all your data, progress, and history. This action <strong>cannot</strong> be undone.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setDeleteStep(2)}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all hover:translate-y-[-2px]"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {deleteStep === 2 && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Acknowledgement</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Please confirm that you understand the consequences.</p>

                                    <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${deleteConfirm ? 'bg-red-600 border-red-600' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {deleteConfirm && <Check size={14} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={deleteConfirm}
                                            onChange={(e) => setDeleteConfirm(e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            I understand that my account and all associated data will be permanently deleted and cannot be recovered.
                                        </span>
                                    </label>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Type <span className="text-red-600">delete my account</span> to confirm
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmationText}
                                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                                            placeholder="delete my account"
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setDeleteStep(1)}
                                            className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setDeleteStep(3)}
                                            disabled={!deleteConfirm || deleteConfirmationText !== 'delete my account'}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all hover:translate-y-[-2px]"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {deleteStep === 3 && (
                                <div className="space-y-6">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Security Verification</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter your password to confirm deletion.</p>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showDeletePass ? "text" : "password"}
                                                value={deletePassword}
                                                onChange={(e) => setDeletePassword(e.target.value)}
                                                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                onClick={() => setShowDeletePass(!showDeletePass)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showDeletePass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setDeleteStep(2)}
                                            className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={!deletePassword || isDeleting}
                                            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Deleting…</>
                                            ) : 'Delete Account'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default UserProfilePage;
