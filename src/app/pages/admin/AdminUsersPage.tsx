import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { Search, Download, Plus, Eye, Edit2, Trash2, Filter, Shield, Check, MoreVertical, X, AlertTriangle, Ban } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminUsersPage: React.FC = () => {
    const { token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<any>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const [apiError, setApiError] = useState<string | null>(null);

    // Modal States
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isSuspendOpen, setIsSuspendOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: 'student', idNumber: '', gradeSection: ''
    });

    const fetchUsers = async () => {
        try {
            const res = await fetch('https://smartcash-eudv.onrender.com/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Map API data to UI model
                const mappedUsers = data.map((user: any) => ({
                    id: user.id,
                    name: user.full_name || user.email,
                    email: user.email,
                    role: user.role,
                    gradeSection: user.grade_level ? `${user.grade_level} - ${user.strand}` : 'N/A',
                    lastActive: user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never',
                    status: user.status || 'Active',
                    idNumber: user.school_id,
                }));
                setUsersList(mappedUsers);
            } else {
                if (res.status === 401) {
                    logout();
                    return;
                }
                const errData = await res.json();
                setApiError(errData.error || 'Failed to load users.');
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
            setApiError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
        else setLoading(false);
    }, [token]);

    const handleViewUser = (user: any) => {
        setSelectedUser(user);
        setIsViewOpen(true);
        setActiveMenu(null);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser({ ...user }); // Copy for editing
        setIsEditOpen(true);
        setActiveMenu(null);
    };

    const handleDeleteUserModal = (user: any) => {
        setSelectedUser(user);
        setIsDeleteOpen(true);
        setActiveMenu(null);
    };

    const handleApproveUserModal = (user: any) => {
        setSelectedUser(user);
        setIsApproveOpen(true);
        setActiveMenu(null);
    };

    const handleSuspendUserModal = (user: any) => {
        setSelectedUser(user);
        setIsSuspendOpen(true);
        setActiveMenu(null);
    };

    const handleAddUser = async () => {
        try {
            const res = await fetch('https://smartcash-eudv.onrender.com/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: newUser.email,
                    password: newUser.password,
                    fullName: newUser.name, // Expected by adminController.ts
                    role: newUser.role,
                    idNumber: newUser.idNumber, // Expected by adminController.ts
                    gradeSection: newUser.gradeSection // Expected by adminController.ts
                })
            });

            let data;
            try {
                data = await res.json();
            } catch (e) {
                console.warn('API did not return JSON');
            }

            if (res.ok) {
                fetchUsers();
                setIsAddOpen(false);
                setNewUser({ name: '', email: '', password: '', role: 'student', idNumber: '', gradeSection: '' });
                alert('User added successfully!');
            } else {
                alert(`Failed to add user: ${data?.error || `Status: ${res.status}`}`);
            }
        } catch (error: any) {
            console.error('Error adding user:', error);
            alert(`An error occurred while adding the user: ${error.message}`);
        }
    };

    const handleDownloadCSV = () => {
        // Prepare CSV Data
        const headers = ['Name', 'Email', 'Role', 'Status', 'ID Number', 'Grade Profile', 'Last Active'];
        const csvRows = [headers.join(',')]; // Header row

        filteredUsers.forEach(user => {
            const row = [
                `"${user.name}"`,
                `"${user.email}"`,
                `"${user.role}"`,
                `"${user.status}"`,
                `"${user.idNumber || 'N/A'}"`,
                `"${user.gradeSection || 'N/A'}"`,
                `"${user.lastActive}"`
            ];
            csvRows.push(row.join(','));
        });

        // Create Blob and Trigger Download
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'SmartCash_Users_Export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleSaveUser = async () => {
        try {
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/admin/users/${selectedUser.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: selectedUser.status })
            });
            if (res.ok) {
                fetchUsers();
                setIsEditOpen(false);
                setSelectedUser(null);
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const confirmDeleteUser = async () => {
        try {
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
                setIsDeleteOpen(false);
                setSelectedUser(null);
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const confirmApproveUser = async () => {
        try {
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/admin/users/${selectedUser.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Active' })
            });
            if (res.ok) {
                fetchUsers();
                setIsApproveOpen(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Error approving user:', error);
        }
    };

    const confirmSuspendUser = async () => {
        try {
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/admin/users/${selectedUser.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Suspended' })
            });
            if (res.ok) {
                fetchUsers();
                setIsSuspendOpen(false);
                setSelectedUser(null);
            }
        } catch (error) {
            console.error('Error suspending user:', error);
        }
    };

    const filteredUsers = usersList.filter(user => {
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'suspended' && user.status === 'Suspended') ||
            user.role === activeTab ||
            (activeTab === 'professor' && user.role === 'teacher');
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { id: 'all', label: 'All Accounts' },
        { id: 'student', label: 'Student' },
        { id: 'professor', label: 'Professor' }, // Mapping 'teacher' role to this
        { id: 'admin', label: 'Admin' },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">User Accounts</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage students, faculty, and staff access.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleDownloadCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all">
                            <Download size={18} />
                            Download All
                        </button>
                        <button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all">
                            <Plus size={18} />
                            Add User
                        </button>
                    </div>
                </header>

                {apiError && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-xl border border-red-200 mb-6">
                        <strong>Error:</strong> {apiError}
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    {/* Controls Row */}
                    <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800">
                        {/* Tabs */}
                        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-slate-500 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-slate-500 transition-all text-xs"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-slate-600 dark:text-slate-300">
                            <thead className="text-[10px] uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Grade/Section</th>
                                    <th className="px-4 py-3">Last Active</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-xs md:text-sm">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20' :
                                                user.role === 'teacher' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                                                    'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                                }`}>
                                                {user.role === 'admin' && <Shield size={10} />}
                                                <span className="capitalize">{user.role}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                                            {user.gradeSection}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{user.lastActive}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10' :
                                                user.status === 'Suspended' ? 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700' :
                                                    'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10'
                                                }`}>
                                                <div className={`w-1 h-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 dark:bg-emerald-400' :
                                                    user.status === 'Suspended' ? 'bg-slate-500 dark:bg-slate-400' :
                                                        'bg-yellow-500 dark:bg-yellow-400'}`} />
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                                        setMenuPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                                                        setActiveMenu(activeMenu === user.id ? null : user.id);
                                                    }}
                                                    className={`p-2 rounded-xl transition-all ${activeMenu === user.id
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Backdrop + Fixed Dropdown Portal */}
                        {activeMenu !== null && (() => {
                            const menuUser = filteredUsers.find(u => u.id === activeMenu);
                            return menuUser ? (
                                <>
                                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveMenu(null)} />
                                    <div
                                        className="fixed z-50 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                                        style={{ top: menuPosition.top, right: menuPosition.right }}
                                    >
                                        <div className="p-1.5 flex flex-col gap-0.5">
                                            <button onClick={() => handleViewUser(menuUser)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                                                <Eye size={14} className="text-blue-500" /> View Profile
                                            </button>
                                            <button onClick={() => handleEditUser(menuUser)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                                                <Edit2 size={14} className="text-amber-500" /> Edit Details
                                            </button>
                                            {menuUser.status === 'Active' && (
                                                <button onClick={() => handleSuspendUserModal(menuUser)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                                                    <Ban size={14} className="text-orange-500" /> Suspend Account
                                                </button>
                                            )}
                                            {menuUser.status === 'Suspended' && (
                                                <button onClick={() => handleApproveUserModal(menuUser)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors text-left">
                                                    <Check size={14} /> Reactivate Account
                                                </button>
                                            )}
                                            {menuUser.status === 'Pending' ? (
                                                <button onClick={() => handleApproveUserModal(menuUser)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors text-left">
                                                    <Check size={14} /> Approve Account
                                                </button>
                                            ) : (
                                                <button onClick={() => handleDeleteUserModal(menuUser)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left">
                                                    <Trash2 size={14} /> Delete Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : null;
                        })()}

                        {/* VIEW USER MODAL */}
                        {isViewOpen && selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Profile</h3>
                                        <button onClick={() => setIsViewOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                            <X size={20} className="text-slate-500" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500">
                                                {selectedUser.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Role</p>
                                                <p className="font-semibold text-slate-900 dark:text-white capitalize">{selectedUser.role}</p>
                                            </div>
                                            {(selectedUser.role === 'student' || selectedUser.role === 'teacher') && (
                                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">ID Number</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer transition-colors" title="Click to copy">
                                                        {selectedUser.idNumber || 'N/A'}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${selectedUser.status === 'Active' ? 'text-emerald-600 bg-emerald-100' : 'text-yellow-600 bg-yellow-100'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedUser.status === 'Active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                                    {selectedUser.status}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Grade/Section</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.gradeSection}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Last Active</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{selectedUser.lastActive}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-2">
                                        <button onClick={() => setIsViewOpen(false)} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ADD USER MODAL */}
                        {isAddOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New User</h3>
                                        <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                            <X size={20} className="text-slate-500" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                                <input
                                                    value={newUser.name}
                                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                                <select
                                                    value={newUser.role}
                                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                                            <input
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                placeholder="Set user password"
                                            />
                                        </div>
                                        {(newUser.role === 'student' || newUser.role === 'teacher') && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ID Number</label>
                                                    <input
                                                        value={newUser.idNumber}
                                                        onChange={(e) => setNewUser({ ...newUser, idNumber: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        placeholder="S-12345"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Grade Profile</label>
                                                    <input
                                                        value={newUser.gradeSection}
                                                        onChange={(e) => setNewUser({ ...newUser, gradeSection: e.target.value })}
                                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        placeholder="e.g. 11 - STEM"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 z-10">
                                        <button onClick={() => setIsAddOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                        <button onClick={handleAddUser} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!newUser.email || !newUser.password || !newUser.name}>Create User</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EDIT USER MODAL */}
                        {isEditOpen && selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User</h3>
                                        <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                            <X size={20} className="text-slate-500" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                            <input
                                                value={selectedUser.name}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                            <input
                                                value={selectedUser.email}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        {(selectedUser.role === 'student' || selectedUser.role === 'teacher') && (
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">ID Number</label>
                                                <input
                                                    value={selectedUser.idNumber || ''}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, idNumber: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    placeholder="Enter ID Number"
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                                <select
                                                    value={selectedUser.role}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                                <select
                                                    value={selectedUser.status}
                                                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Suspended">Suspended</option>
                                                    <option value="Inactive">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                        <button onClick={() => setIsEditOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                                        <button onClick={handleSaveUser} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors">Save Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* DELETE CONFIRMATION MODAL */}
                        {isDeleteOpen && selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center border-b border-red-100 dark:border-red-900/30">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Delete Account?</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{selectedUser.name}</strong>? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="p-6 flex flex-col gap-3">
                                        <button onClick={confirmDeleteUser} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-colors">
                                            Yes, Delete Account
                                        </button>
                                        <button onClick={() => setIsDeleteOpen(false)} className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* APPROVE CONFIRMATION MODAL */}
                        {isApproveOpen && selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 flex flex-col items-center text-center border-b border-emerald-100 dark:border-emerald-900/30">
                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                                            <Check size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Approve Account?</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            Are you sure you want to approve <strong className="text-slate-900 dark:text-white">{selectedUser.name}</strong>? They will gain access to the platform.
                                        </p>
                                    </div>
                                    <div className="p-6 flex flex-col gap-3">
                                        <button onClick={confirmApproveUser} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-colors">
                                            Yes, Approve Account
                                        </button>
                                        <button onClick={() => setIsApproveOpen(false)} className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredUsers.length === 0 && (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                                    No users found matching current filters.
                                </p>
                            </div>
                        )}

                        {/* SUSPEND CONFIRMATION MODAL */}
                        {isSuspendOpen && selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 flex flex-col items-center text-center border-b border-orange-100 dark:border-orange-900/30">
                                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
                                            <Ban size={24} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Suspend Account?</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            Are you sure you want to suspend <strong className="text-slate-900 dark:text-white">{selectedUser.name}</strong>? They will temporarily lose access.
                                        </p>
                                    </div>
                                    <div className="p-6 flex flex-col gap-3">
                                        <button onClick={confirmSuspendUser} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-colors">
                                            Yes, Suspend Account
                                        </button>
                                        <button onClick={() => setIsSuspendOpen(false)} className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminUsersPage;
