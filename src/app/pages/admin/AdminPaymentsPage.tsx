import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { Check, X, Loader2, AlertTriangle, FileImage } from 'lucide-react';

interface PendingPayment {
  _id: string;
  amount: number;
  extractedAmount?: number;
  referenceNumber?: string;
  senderNumber?: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptImage: string;
  createdAt: string;
  user: {
    _id: string;
    full_name: string;
    email: string;
    school_id?: string;
  };
}

const AdminPaymentsPage: React.FC = () => {
  const { token, logout } = useAuth();
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // To store _id of payment being processed
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/payments/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      } else {
        if (res.status === 401) logout();
        const errData = await res.json();
        setError(errData.error || 'Failed to load payments.');
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      setError('Network error loading payments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/payments/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Update payment status locally instead of removing it
        setPayments(prev => prev.map(p => p._id === id ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' } : p));
      } else {
        const errData = await res.json();
        alert(errData.error || `Failed to ${action} payment.`);
      }
    } catch (err: any) {
      console.error(`Error ${action} payment:`, err);
      alert(`Network error during ${action}.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Pending Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Review and manage recent premium upgrades.</p>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertTriangle size={20} />
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
             <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
             <p className="text-slate-500 font-medium">Loading pending payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-12 shadow-sm text-center">
             <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-emerald-500" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
             <p className="text-slate-500 dark:text-slate-400">There are no pending payments requiring review.</p>
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Amount Due</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Extracted Data</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Receipt Image</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Date & Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {payments.map(payment => (
                    <tr key={payment._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{payment.user?.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-slate-500">{payment.user?.email || 'No email provided'}</div>
                        {payment.user?.school_id && (
                          <div className="text-xs text-slate-400 mt-0.5">ID: {payment.user.school_id}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        ₱ {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <p><span className="font-semibold text-slate-500">Ref:</span> {payment.referenceNumber || <span className="italic text-slate-300">N/A</span>}</p>
                          <p><span className="font-semibold text-slate-500">Sender:</span> {payment.senderNumber || <span className="italic text-slate-300">N/A</span>}</p>
                          <p><span className="font-semibold text-slate-500">Extracted Amt:</span> {payment.extractedAmount ? `₱${payment.extractedAmount.toFixed(2)}` : <span className="italic text-slate-300">N/A</span>}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button 
                             onClick={() => setZoomedImage(payment.receiptImage)}
                             className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors"
                          >
                             {payment.receiptImage.startsWith('data:image') ? (
                               <img src={payment.receiptImage} alt="Receipt" className="w-16 h-16 object-cover" />
                             ) : (
                               <div className="w-16 h-16 bg-slate-100 flex items-center justify-center"><FileImage className="text-slate-400" /></div>
                             )}
                             <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-[2px]">
                                <span className="text-white text-xs font-semibold tracking-wider uppercase">View</span>
                             </div>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">
                        {new Date(payment.createdAt).toLocaleDateString()} <br/>
                        <span className="text-xs mb-2 block">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                        {payment.status === 'pending' && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">PENDING</span>}
                        {payment.status === 'approved' && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">APPROVED</span>}
                        {payment.status === 'rejected' && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">REJECTED</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         {payment.status === 'pending' ? (
                           <div className="flex items-center justify-end gap-2">
                             {actionLoading === payment._id ? (
                               <div className="px-4 py-2 flex items-center gap-2 text-slate-500">
                                 <Loader2 size={16} className="animate-spin" /> Processing
                               </div>
                             ) : (
                               <>
                                <button 
                                  onClick={() => handleAction(payment._id, 'approve')}
                                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  <Check size={16} /> Approve
                                </button>
                                <button 
                                  onClick={() => handleAction(payment._id, 'reject')}
                                  className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                                  title="Reject Payment"
                                >
                                  <X size={20} />
                                </button>
                               </>
                             )}
                           </div>
                         ) : (
                           <div className="text-slate-400 italic text-sm pr-2">Resolved</div>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Image Modal */}
      {zoomedImage && (
         <div 
           className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
           onClick={() => setZoomedImage(null)}
         >
            <div className="relative max-w-4xl max-h-[90vh]">
               <button className="absolute -top-12 right-0 text-white/70 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md transition-all">
                  <X size={24} />
               </button>
               <img src={zoomedImage} alt="Zoomed Receipt" className="max-w-full max-h-[90vh] object-contain rounded-xl border-4 border-slate-800" />
            </div>
         </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPaymentsPage;
