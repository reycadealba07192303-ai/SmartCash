import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { Database, Server, Shield, Activity, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';



const AdminDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    serverStatus: '99.9%',
    securityFlags: 0,
    dailyActive: 0,
    roleDistribution: [] as any[],
    activityData: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          if (res.status === 401) {
            logout();
            return;
          }
          const errData = await res.json();
          setApiError(errData.error || 'Failed to load stats.');
        }
      } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        setApiError(error.message);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">System Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Monitor system health and analytics.</p>
        </header>

        {apiError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl border border-red-200">
            <strong>Error:</strong> {apiError}
          </div>
        )}

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Database, color: 'text-purple-500', shadow: 'shadow-purple-500/20' },
            { label: 'Server Status', value: stats.serverStatus, icon: Server, color: 'text-emerald-500', shadow: 'shadow-emerald-500/20' },
            { label: 'Security Flags', value: stats.securityFlags.toString(), icon: Shield, color: 'text-blue-500', shadow: 'shadow-blue-500/20' },
            { label: 'Daily Active', value: stats.dailyActive.toLocaleString(), icon: Activity, color: 'text-orange-500', shadow: 'shadow-orange-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl ${stat.shadow} hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 ${stat.color}`}>
                  <stat.icon size={26} />
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full uppercase tracking-wide">Live</span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-1 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  User Activity
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Active vs New users over the last 7 days</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activityData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="active" name="Active Users" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="new" name="New Registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Chart */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-purple-500" />
                Role Distribution
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Breakdown of account types</p>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.roleDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {(stats.roleDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="mt-auto pt-6 flex flex-col gap-3">
              {(stats.roleDistribution || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{Math.round((item.value / stats.totalUsers) * 100) || 0}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
