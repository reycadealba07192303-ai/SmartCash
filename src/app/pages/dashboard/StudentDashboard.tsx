import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { BookOpen, Trophy, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const StudentDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>({
    fullName: '',
    lessonsCompleted: '0/0',
    currentStreak: '0 Days',
    totalSavings: '₱0',
    badgesEarned: 0,
    activeChallenge: null
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const [statsRes, lbRes] = await Promise.all([
          fetch('http://localhost:5000/api/student/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/badges/leaderboard', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats((prev: any) => ({ ...prev, ...statsData }));
        }

        if (lbRes.ok) {
          const lbData = await lbRes.json();
          setLeaderboard(Array.isArray(lbData) ? lbData.slice(0, 3) : []);
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
