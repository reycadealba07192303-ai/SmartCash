import React, { useEffect, useState } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../../config/api';
import { Loader2, Receipt, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function StudentPaymentsPage() {
    const { token } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/payments/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data);
                }
            } catch (err) {
                console.error("Error fetching payments", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchPayments();
    }, [token]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle size={18} className="text-emerald-500" />;
            case 'rejected': return <XCircle size={18} className="text-rose-500" />;
            default: return <Clock size={18} className="text-amber-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs">APPROVED</span>;
            case 'rejected': return <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full text-xs">REJECTED</span>;
            default: return <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs">PENDING</span>;
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Payment History</h1>
                    <p className="text-slate-500 dark:text-slate-400">View the status of your premium subscriptions and transactions.</p>
                </header>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex justify-center text-slate-400">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <Receipt className="text-slate-300 dark:text-slate-700 mb-4" size={48} />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No Transactions Found</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">You haven't made any payment requests yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount Paid</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reference No.</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sender No.</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {payments.map(tx => (
                                        <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                                                {tx.createdAt && !isNaN(new Date(tx.createdAt).getTime()) ? new Date(tx.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'} <br/>
                                                <span className="text-xs text-slate-400">
                                                    {tx.createdAt && !isNaN(new Date(tx.createdAt).getTime()) ? new Date(tx.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-slate-900 dark:text-white">₱ {tx.amount ? Number(tx.amount).toFixed(2) : '0.00'}</p>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                {tx.referenceNumber || 'Processing...'}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                                                {tx.senderNumber || 'N/A'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(tx.status)}
                                                    {getStatusText(tx.status)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
