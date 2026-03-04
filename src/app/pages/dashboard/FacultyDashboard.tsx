import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Users, FileText, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const FacultyDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    submissions: 8,
    needsAttention: 3
  });
  const [progressRows, setProgressRows] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const res = await fetch('https://smartcash-eudv.onrender.com/api/faculty/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (error) {
        console.error('Error fetching faculty stats:', error);
      }
    };

    const fetchProgress = async () => {
      try {
        const res = await fetch('https://smartcash-eudv.onrender.com/api/faculty/student-progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setProgressRows(await res.json());
      } catch (error) {
        console.error('Error fetching student progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchStats();
    fetchProgress();
  }, [token]);

  return (
    <DashboardLayout role="teacher">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Faculty Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Manage your ABM students and curriculum.</p>
          </div>
          <button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5">
            + Create New Quiz
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-blue-500/5 hover:translate-y-[-4px] transition-all duration-300 flex items-center gap-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl ring-1 ring-inset ring-blue-500/10">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Students</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalStudents}</p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-emerald-500/5 hover:translate-y-[-4px] transition-all duration-300 flex items-center gap-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl ring-1 ring-inset ring-emerald-500/10">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Submissions</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.submissions}</p>
            </div>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-orange-500/5 hover:translate-y-[-4px] transition-all duration-300 flex items-center gap-5">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl ring-1 ring-inset ring-orange-500/10">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Needs Attention</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.needsAttention}</p>
            </div>
          </div>
        </div>

        {/* Recent Student Activity Table */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Recent Student Progress</h3>
            <button className="text-sm text-emerald-600 font-bold hover:text-emerald-700 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto p-2">
            {loadingProgress ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              </div>
            ) : progressRows.length === 0 ? (
              <div className="text-center text-slate-500 py-16">
                <Activity size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                <p className="font-semibold">No student activity yet.</p>
                <p className="text-sm mt-1">Progress will appear here once students start completing lessons.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-slate-500 uppercase font-bold text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-l-xl bg-slate-50/50 dark:bg-slate-800/50">Student</th>
                    <th className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">Lesson</th>
                    <th className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">Module</th>
                    <th className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">Status</th>
                    <th className="px-6 py-4 rounded-r-xl bg-slate-50/50 dark:bg-slate-800/50">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {progressRows.map((row, i) => (
                    <tr key={i} className="group hover:bg-white dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {row.studentName.charAt(0).toUpperCase()}
                          </div>
                          {row.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">{row.lessonTitle}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-xs font-medium">{row.moduleTitle}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${row.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30'
                            : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-medium">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
