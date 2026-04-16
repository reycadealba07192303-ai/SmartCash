import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { BookOpen, Trophy, TrendingUp, Clock, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine
} from 'recharts';
import { API_BASE } from '../../../config/api';

const StudentDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>({
    fullName: '',
    isPremium: undefined,
    lessonsCompleted: '0/0',
    currentStreak: '0 Days',
    totalSavings: '₱0',
    badgesEarned: 0,
    activeChallenge: null
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const [statsRes, lbRes, histRes] = await Promise.all([
          fetch(`${API_BASE}/api/student/dashboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/badges/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/student/quizzes/history`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats((prev: any) => ({ ...prev, ...statsData }));
        }

        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(Array.isArray(lbData) ? lbData.slice(0, 3) : []);
        }

        if (histRes.ok) {
          const histData = await histRes.json();
          if (Array.isArray(histData)) {
            // Sort oldest → newest for chart, take last 10
            const sorted = [...histData].sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());
            setQuizHistory(sorted.slice(-10));
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, [token]);

  return (
    <DashboardLayout role="student">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">{(stats.fullName || user?.full_name || 'Student').split(' ')[0]}!</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Track your progress and learn something new today.</p>
        </header>

        {/* Premium Upgrade Banner */}
        {((stats.isPremium !== undefined ? !stats.isPremium : !user?.isPremium)) && (
          <div className="mb-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
             <div className="flex-1 relative z-10">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Trophy size={20} /> Upgrade to Premium</h3>
                <p className="text-amber-50">Your account is currently Basic. Upgrade to Premium to unlock all downloadable templates, advanced budget tools, and unlimited AI quizzes!</p>
             </div>
             <Link to="/checkout" className="relative z-10 shrink-0 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-lg hover:scale-105 transition-all">
                Resubscribe Now
             </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Lessons Completed', value: stats.lessonsCompleted || '0', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', shadow: 'shadow-blue-500/10' },
            { label: 'Current Streak', value: stats.currentStreak || '0 Days', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', shadow: 'shadow-orange-500/10' },
            { label: 'Total Savings', value: stats.totalSavings || '₱0', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', shadow: 'shadow-emerald-500/10' },
            { label: 'Badges Earned', value: stats.badgesEarned?.toString() || '0', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', shadow: 'shadow-purple-500/10' },
          ].map((stat, i) => (
            <div key={i} className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl ${stat.shadow} hover:translate-y-[-4px] transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
                  <stat.icon size={22} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Weekly Challenge */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-teal-900/20 rounded-full blur-3xl"></div>

            <h3 className="font-bold text-xl mb-2 relative z-10">Weekly Challenge</h3>

            {stats.activeChallenge ? (
              <>
                <p className="text-emerald-100 text-sm mb-6 relative z-10 font-medium">{stats.activeChallenge.name}</p>
                <div className="w-full bg-black/20 h-2.5 rounded-full mb-3 overflow-hidden backdrop-blur-sm relative z-10">
                  <div
                    className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500"
                    style={{ width: `${Math.min((stats.activeChallenge.current / stats.activeChallenge.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm font-bold text-right text-emerald-100 relative z-10">
                  ₱{stats.activeChallenge.current.toLocaleString()} / ₱{stats.activeChallenge.target.toLocaleString()}
                </p>
              </>
            ) : (
              <>
                <p className="text-emerald-100 text-sm mb-6 relative z-10 font-medium">You have no active challenges right now.</p>
                <Link to="/dashboard/student/budget" className="inline-block relative z-10 bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-emerald-50 transition">
                  Join a Challenge
                </Link>
              </>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Leaderboard</h3>
            <div className="space-y-5">
              {(leaderboard || []).length > 0 ? (leaderboard || []).map((user, pos) => (
                <div key={user.id || pos} className="flex items-center gap-4 group">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm ${pos === 0 ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                    {pos + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 shadow-sm flex flex-col items-center justify-center overflow-hidden uppercase font-bold text-slate-500 text-sm">
                    {user.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{user.name}</p>
                    <p className="text-xs font-semibold text-slate-500">{user.points} pts</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Leaderboard is calculating...</p>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Score History Chart */}
        {quizHistory.length > 0 && (
          <div className="mt-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                <BarChart2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Score History</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your last {quizHistory.length} quiz attempts</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-56 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizHistory.map((q, i) => ({ name: `#${i + 1}`, score: Math.round(q.percentage), title: q.quiz_title, passed: q.percentage >= 80 }))} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700/50 max-w-[180px]">
                          <p className="font-bold mb-1 truncate">{d.title}</p>
                          <p className={`font-semibold ${d.passed ? 'text-emerald-400' : 'text-red-400'}`}>{d.score}% — {d.passed ? '✓ Passed' : '✗ Failed'}</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 2" strokeWidth={1.5} label={{ value: 'Pass 80%', position: 'right', fill: '#10b981', fontSize: 10 }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {quizHistory.map((q, index) => (
                      <Cell key={index} fill={q.percentage >= 80 ? '#10b981' : '#f43f5e'} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Attempts Table */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Attempts</p>
              {[...quizHistory].reverse().slice(0, 5).map((q, i) => {
                const passed = q.percentage >= 80;
                const date = new Date(q.taken_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors">
                    <div className={`flex-shrink-0 ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {passed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{q.quiz_title}</p>
                      <p className="text-xs text-slate-400">{date}</p>
                    </div>
                    <div className={`text-sm font-extrabold flex-shrink-0 ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {Math.round(q.percentage)}%
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${passed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                      {passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
