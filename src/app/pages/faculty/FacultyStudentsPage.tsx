import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { Search, Filter, MoreHorizontal, Mail, Loader2, AlertCircle, ChevronLeft, ChevronRight, X, BookOpen, TrendingUp, Send, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface StudentData {
    id: string;
    full_name: string;
    email: string;
    grade?: string;
    progress?: number;
    lessonsCompleted?: number;
    totalLessons?: number;
    status: string;
}

interface DropdownPos { top: number; left: number; }

const LIMIT = 10;

const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
};

const FacultyStudentsPage: React.FC = () => {
    const { token } = useAuth();
    const [students, setStudents] = useState<StudentData[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [exporting, setExporting] = useState(false);

    // Dropdown menu state
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [dropdownPos, setDropdownPos] = useState<DropdownPos>({ top: 0, left: 0 });

    // Modals
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
    const [emailModal, setEmailModal] = useState<{ student: StudentData; subject: string; message: string } | null>(null);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const fetchStudents = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
            if (debouncedSearch) params.set('search', debouncedSearch);
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/faculty/students?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch students');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStudents(data); setTotal(data.length);
            } else {
                setStudents(data.students || []); setTotal(data.total || 0);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, page, debouncedSearch]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const totalPages = Math.ceil(total / LIMIT);
    const from = total === 0 ? 0 : (page - 1) * LIMIT + 1;
    const to = Math.min(page * LIMIT, total);

    const openMenu = (e: React.MouseEvent<HTMLButtonElement>, studentId: string) => {
        e.stopPropagation();
        if (openMenuId === studentId) { setOpenMenuId(null); return; }
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.right - 192 + window.scrollX });
        setOpenMenuId(studentId);
    };

    const exportStudents = async () => {
        if (!token || exporting) return;
        setExporting(true);
        try {
            // Fetch ALL students for export (no page limit)
            const res = await fetch(`https://smartcash-eudv.onrender.com/api/faculty/students?page=1&limit=10000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const all: StudentData[] = Array.isArray(data) ? data : (data.students || []);

            const headers = ['Full Name', 'Email', 'Grade & Section', 'Progress (%)', 'Lessons Completed', 'Total Lessons', 'Status'];
            const rows = all.map(s => [
                s.full_name || 'Unknown',
                s.email,
                s.grade || 'Grade 12 - ABM',
                String(Math.round(s.progress || 0)),
                String(s.lessonsCompleted || 0),
                String(s.totalLessons || 0),
                s.status
            ]);

            const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\r\n');
            const date = new Date().toISOString().slice(0, 10);
            downloadCSV(`students_export_${date}.csv`, csv);
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setExporting(false);
        }
    };

    const openEmailModal = (student: StudentData) => {
        setOpenMenuId(null);
        setEmailSent(false);
        setEmailModal({ student, subject: `Message from SmartCash Faculty`, message: '' });
    };

    const handleSendEmail = async () => {
        if (!emailModal || !emailModal.message.trim()) return;
        setSendingEmail(true);
        // Simulate send (opens mailto as fallback since no email server is wired)
        await new Promise(r => setTimeout(r, 800));
        // Open mailto as an actual send mechanism
        const mailto = `mailto:${emailModal.student.email}?subject=${encodeURIComponent(emailModal.subject)}&body=${encodeURIComponent(emailModal.message)}`;
        window.open(mailto, '_blank');
        setSendingEmail(false);
        setEmailSent(true);
        setTimeout(() => setEmailModal(null), 1800);
    };

    return (
        <>
            <DashboardLayout role="teacher">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Student Management</h1>
                            <p className="text-slate-500 dark:text-slate-400">Track progress and manage your ABM students.</p>
                        </div>
                        <button
                            onClick={exportStudents}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60"
                        >
                            {exporting
                                ? <><Loader2 size={16} className="animate-spin" /> Exporting...</>
                                : <><Download size={16} /> Export Data</>
                            }
                        </button>
                    </header>

                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
                        {/* Controls */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search students by name or email..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <Filter size={18} /> Filter
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4">Grade & Section</th>
                                        <th className="px-6 py-4">Progress</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />Loading students...
                                        </td></tr>
                                    ) : error ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-red-500">
                                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />{error}
                                        </td></tr>
                                    ) : students.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                            {debouncedSearch ? `No students matching "${debouncedSearch}"` : 'No ABM students found.'}
                                        </td></tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm shrink-0">
                                                            {(student.full_name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white">{student.full_name || 'Unknown'}</div>
                                                            <div className="text-xs text-slate-500">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{student.grade || 'Grade 12 - ABM'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full max-w-[150px]">
                                                        <div className="flex justify-between text-xs font-bold mb-1">
                                                            <span>{Math.round(student.progress || 0)}%</span>
                                                            {student.totalLessons !== undefined && (
                                                                <span className="text-slate-400 font-normal">{student.lessonsCompleted}/{student.totalLessons} lessons</span>
                                                            )}
                                                        </div>
                                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${(student.progress || 0) >= 70 ? 'bg-emerald-500' : (student.progress || 0) >= 30 ? 'bg-yellow-500' : (student.progress || 0) > 0 ? 'bg-orange-500' : 'bg-slate-300'}`}
                                                                style={{ width: `${student.progress || 0}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30' : student.status === 'At Risk' ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20' : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                                                        {student.status || 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); openEmailModal(student); }}
                                                            title="Send Email"
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Mail size={18} />
                                                        </button>
                                                        <button
                                                            onClick={e => openMenu(e, student.id)}
                                                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                        >
                                                            <MoreHorizontal size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-sm text-slate-500">
                            <span>{loading ? 'Loading...' : total === 0 ? 'No students found' : `Showing ${from}–${to} of ${total} student${total !== 1 ? 's' : ''}`}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading}
                                    className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <span className="flex items-center px-3 py-2 text-xs font-semibold">{page} / {totalPages || 1}</span>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}
                                    className="flex items-center gap-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>

            {/* ──────── FIXED-POSITION DROPDOWN MENU ──────── */}
            {openMenuId && (() => {
                const student = students.find(s => s.id === openMenuId);
                if (!student) return null;
                return (
                    <div
                        style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
                        onClick={e => e.stopPropagation()}
                        className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                        <button onClick={() => { setSelectedStudent(student); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <TrendingUp size={15} className="text-indigo-500" /> View Details
                        </button>
                        <button onClick={() => openEmailModal(student)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Mail size={15} className="text-emerald-500" /> Send Email
                        </button>
                        <button onClick={() => setOpenMenuId(null)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <BookOpen size={15} className="text-amber-500" /> View Modules
                        </button>
                    </div>
                );
            })()}

            {/* ──────── STUDENT DETAILS MODAL ──────── */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Details</h3>
                            <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl font-bold text-emerald-600">
                                    {selectedStudent.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">{selectedStudent.full_name}</div>
                                    <div className="text-sm text-slate-500">{selectedStudent.email}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Grade & Section</div>
                                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{selectedStudent.grade || 'Grade 12 - ABM'}</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">Status</div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${selectedStudent.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : selectedStudent.status === 'At Risk' ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {selectedStudent.status}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 uppercase font-bold">Lesson Progress</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{Math.round(selectedStudent.progress || 0)}%</span>
                                </div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${(selectedStudent.progress || 0) >= 70 ? 'bg-emerald-500' : (selectedStudent.progress || 0) >= 30 ? 'bg-yellow-500' : 'bg-orange-400'}`}
                                        style={{ width: `${selectedStudent.progress || 0}%` }} />
                                </div>
                                {selectedStudent.totalLessons !== undefined && (
                                    <p className="text-xs text-slate-500 mt-2">{selectedStudent.lessonsCompleted} of {selectedStudent.totalLessons} lessons completed</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                            <button onClick={() => { openEmailModal(selectedStudent); setSelectedStudent(null); }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm">
                                <Mail size={16} /> Send Email
                            </button>
                            <button onClick={() => setSelectedStudent(null)}
                                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──────── COMPOSE EMAIL MODAL ──────── */}
            {emailModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEmailModal(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 text-sm">
                                    {emailModal.student.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{emailModal.student.full_name}</div>
                                    <div className="text-xs text-slate-500">{emailModal.student.email}</div>
                                </div>
                            </div>
                            <button onClick={() => setEmailModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        {/* Form */}
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                                <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    {emailModal.student.email}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={emailModal.subject}
                                    onChange={e => setEmailModal({ ...emailModal, subject: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                                    placeholder="Email subject..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label>
                                <textarea
                                    value={emailModal.message}
                                    onChange={e => setEmailModal({ ...emailModal, message: e.target.value })}
                                    rows={5}
                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white resize-none"
                                    placeholder={`Write your message to ${emailModal.student.full_name}...`}
                                />
                            </div>
                            {emailSent && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl text-sm font-semibold">
                                    ✓ Email sent successfully!
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end">
                            <button onClick={() => setEmailModal(null)}
                                className="px-4 py-2.5 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sendingEmail || !emailModal.message.trim() || emailSent}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm"
                            >
                                {sendingEmail ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {sendingEmail ? 'Sending...' : 'Send Email'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FacultyStudentsPage;
