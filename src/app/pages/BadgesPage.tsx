import React, { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { Award, Lock, Star, Trophy, Medal, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const BadgesPage: React.FC = () => {
    const { token, user } = useAuth();
    const [badges, setBadges] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const lbRes = await fetch('https://smartcash-x4j5.onrender.com/api/badges/leaderboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (lbRes.ok) setLeaderboard(await lbRes.json());
            } catch (err) {
                console.error(err);
            }
        };

        const fetchData = async () => {
            try {
                const badgeRes = await fetch('https://smartcash-x4j5.onrender.com/api/badges', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (badgeRes.ok) setBadges(await badgeRes.json());

                await fetchLeaderboard();
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
            const socket = io('https://smartcash-x4j5.onrender.com');
            socket.on('leaderboard_update', () => {
                fetchLeaderboard();
            });
            return () => { socket.disconnect(); };
        } else {
            setLoading(false);
        }
    }, [token]);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Award': return Award;
            case 'Star': return Star;
            case 'Trophy': return Trophy;
            case 'Medal': return Medal;
            default: return Award;
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    return (
        <DashboardLayout role="student">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Achievements</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Collect badges as you master financial literacy.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left Side - Badges Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {badges.map((badge) => {
                        const Icon = getIcon(badge.icon);
                        return (
                            <div key={badge.id} className={`h-fit relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${badge.unlocked
                                ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:translate-y-[-2px]'
                                : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-80'
                                }`}>
                                <div id={`badge-${badge.id}`} className="flex items-start gap-4">
                                    <div className={`p-4 rounded-2xl ${badge.unlocked ? badge.bg_color : 'bg-slate-200 dark:bg-slate-800'} ${badge.unlocked ? badge.color : 'text-slate-400'}`}>
                                        {badge.unlocked ? <Icon size={32} /> : <Lock size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg ${badge.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {badge.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{badge.description}</p>
                                        {!badge.unlocked && (
                                            <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wide bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md">
                                                Locked
                                            </span>
                                        )}
                                        {badge.unlocked && (
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md">
                                                    Earned
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        // ── Build a certificate using Canvas API ──
                                                        const W = 1123, H = 794; // A4 landscape @ 96dpi
                                                        const canvas = document.createElement('canvas');
                                                        canvas.width = W; canvas.height = H;
                                                        const ctx = canvas.getContext('2d')!;

                                                        // Background gradient
                                                        const bg = ctx.createLinearGradient(0, 0, W, H);
                                                        bg.addColorStop(0, '#0f172a');
                                                        bg.addColorStop(1, '#1e293b');
                                                        ctx.fillStyle = bg;
                                                        ctx.fillRect(0, 0, W, H);

                                                        // Outer gold border
                                                        ctx.strokeStyle = '#d4af37';
                                                        ctx.lineWidth = 6;
                                                        ctx.strokeRect(28, 28, W - 56, H - 56);
                                                        // Inner gold border
                                                        ctx.strokeStyle = 'rgba(212,175,55,0.4)';
                                                        ctx.lineWidth = 2;
                                                        ctx.strokeRect(42, 42, W - 84, H - 84);

                                                        // Corner ornaments
                                                        const ornament = (x: number, y: number, r1: number, r2: number) => {
                                                            ctx.strokeStyle = '#d4af37';
                                                            ctx.lineWidth = 3;
                                                            ctx.beginPath(); ctx.arc(x, y, r1, 0, Math.PI * 2); ctx.stroke();
                                                            ctx.beginPath(); ctx.arc(x, y, r2, 0, Math.PI * 2); ctx.stroke();
                                                        };
                                                        ornament(28, 28, 14, 22);
                                                        ornament(W - 28, 28, 14, 22);
                                                        ornament(28, H - 28, 14, 22);
                                                        ornament(W - 28, H - 28, 14, 22);

                                                        // Header: SmartCash
                                                        ctx.textAlign = 'center';
                                                        ctx.fillStyle = '#10b981';
                                                        ctx.font = 'bold 22px sans-serif';
                                                        ctx.letterSpacing = '6px';
                                                        ctx.fillText('SMARTCASH', W / 2, 100);
                                                        ctx.fillStyle = 'rgba(100,116,139,0.8)';
                                                        ctx.font = '13px sans-serif';
                                                        ctx.letterSpacing = '3px';
                                                        ctx.fillText('FINANCIAL LITERACY PLATFORM', W / 2, 124);

                                                        // Divider line
                                                        const grad2 = ctx.createLinearGradient(160, 0, W - 160, 0);
                                                        grad2.addColorStop(0, 'transparent');
                                                        grad2.addColorStop(0.5, '#d4af37');
                                                        grad2.addColorStop(1, 'transparent');
                                                        ctx.strokeStyle = grad2;
                                                        ctx.lineWidth = 1.5;
                                                        ctx.beginPath(); ctx.moveTo(160, 140); ctx.lineTo(W - 160, 140); ctx.stroke();

                                                        // "Certificate of Achievement"
                                                        ctx.fillStyle = 'rgba(212,175,55,0.85)';
                                                        ctx.font = 'italic 18px Georgia, serif';
                                                        ctx.letterSpacing = '2px';
                                                        ctx.fillText('Certificate of Achievement', W / 2, 180);

                                                        // "This is to certify that"
                                                        ctx.fillStyle = 'rgba(148,163,184,0.9)';
                                                        ctx.font = '15px sans-serif';
                                                        ctx.letterSpacing = '0px';
                                                        ctx.fillText('This is to certify that', W / 2, 220);

                                                        // Student name
                                                        const studentName = (user?.fullName || user?.full_name || user?.email || 'Student').toUpperCase();
                                                        ctx.fillStyle = '#ffffff';
                                                        ctx.font = 'bold 54px Georgia, serif';
                                                        ctx.fillText(studentName, W / 2, 300);

                                                        // Name underline
                                                        const nameW = ctx.measureText(studentName).width;
                                                        ctx.strokeStyle = '#d4af37';
                                                        ctx.lineWidth = 2;
                                                        ctx.beginPath();
                                                        ctx.moveTo(W / 2 - nameW / 2, 312);
                                                        ctx.lineTo(W / 2 + nameW / 2, 312);
                                                        ctx.stroke();

                                                        // "has successfully earned the achievement"
                                                        ctx.fillStyle = 'rgba(148,163,184,0.9)';
                                                        ctx.font = '15px sans-serif';
                                                        ctx.fillText('has successfully earned the achievement', W / 2, 355);

                                                        // Badge name (gold, large)
                                                        ctx.fillStyle = '#fbbf24';
                                                        ctx.font = 'bold 38px Georgia, serif';
                                                        ctx.fillText(`"${badge.name}"`, W / 2, 410);

                                                        // Badge description
                                                        ctx.fillStyle = 'rgba(148,163,184,0.85)';
                                                        ctx.font = '14px sans-serif';
                                                        // Wrap text
                                                        const words = badge.description.split(' ');
                                                        let line = ''; const lines: string[] = [];
                                                        for (const word of words) {
                                                            const test = line + word + ' ';
                                                            if (ctx.measureText(test).width > 600) { lines.push(line.trim()); line = word + ' '; }
                                                            else line = test;
                                                        }
                                                        if (line) lines.push(line.trim());
                                                        lines.forEach((l, i) => ctx.fillText(l, W / 2, 445 + i * 22));

                                                        // Bottom divider
                                                        ctx.strokeStyle = grad2;
                                                        ctx.lineWidth = 1.5;
                                                        ctx.beginPath(); ctx.moveTo(160, H - 140); ctx.lineTo(W - 160, H - 140); ctx.stroke();

                                                        // Date
                                                        const dateStr = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
                                                        ctx.fillStyle = 'rgba(100,116,139,0.8)';
                                                        ctx.font = '13px sans-serif';
                                                        ctx.fillText(`Awarded on ${dateStr}`, W / 2, H - 110);

                                                        // SmartCash seal (emerald circle)
                                                        ctx.fillStyle = '#10b981';
                                                        ctx.beginPath(); ctx.arc(W / 2, H - 65, 24, 0, Math.PI * 2); ctx.fill();
                                                        ctx.fillStyle = '#ffffff';
                                                        ctx.font = 'bold 10px sans-serif';
                                                        ctx.letterSpacing = '1px';
                                                        ctx.fillText('VERIFIED', W / 2, H - 60);

                                                        // Download
                                                        const a = document.createElement('a');
                                                        a.href = canvas.toDataURL('image/png');
                                                        a.download = `SmartCash_Certificate_${badge.name.replace(/\s+/g, '_')}.png`;
                                                        a.click();
                                                    }}
                                                    className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                                    Download
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    </div>

                    {/* Right Side - Level Box + Leaderboard */}
                    <div className="w-full lg:w-[280px] flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
                        {/* Level Box - Compact */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/20">
                                <Trophy size={28} />
                            </div>

                            {(() => {
                                const myRankObj = leaderboard.find(s => s.isMe);
                                const currentXP = myRankObj ? myRankObj.points : 0;
                                const currentLevel = Math.floor(currentXP / 200) + 1;
                                const currentRankName = currentLevel < 3 ? 'Financial Beginner' : (currentLevel < 6 ? 'Financial Novice' : 'Financial Pro');
                                const progressPct = ((currentXP % 200) / 200) * 100;

                                return (
                                    <>
                                        <h2 className="text-2xl font-extrabold mb-0.5">Level {currentLevel}</h2>
                                        <p className="text-purple-200 text-sm font-medium mb-4">{currentRankName}</p>

                                        <div className="relative">
                                            <div className="flex mb-1.5 items-center justify-between text-[10px] font-bold uppercase">
                                                <span>Progress to Lvl {currentLevel + 1}</span>
                                                <span>{currentXP % 200} / 200 XP</span>
                                            </div>
                                            <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-black/20">
                                                <div style={{ width: `${progressPct}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-white rounded-full transition-all duration-500"></div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Class Leaderboard - Tall */}
                        <div className="bg-slate-900/95 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 dark:border-slate-800/50 p-4 shadow-xl relative overflow-hidden flex flex-col flex-1">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />

                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <h3 className="text-sm font-bold font-display text-white tracking-tight">Class Leaderboard</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {leaderboard.map((student) => (
                                    <div key={student.rank} className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 border ${student.isMe ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700/50'}`}>

                                        {/* Rank */}
                                        <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-md text-[10px] font-black shadow-inner ${student.rank === 1 ? 'bg-gradient-to-br from-yellow-200 to-amber-400 text-amber-900 shadow-amber-500/20' :
                                            student.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' :
                                                student.rank === 3 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900' :
                                                    'bg-slate-800 text-slate-400 border border-slate-700'
                                            }`}>
                                            {student.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md ${student.isMe ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                            {student.name.charAt(0)}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-xs leading-tight truncate ${student.isMe ? 'text-emerald-400' : 'text-slate-100'}`}>
                                                {student.name} {student.isMe && '(You)'}
                                            </p>
                                            <p className="text-[9px] font-medium text-slate-400 flex items-center gap-0.5">
                                                <Star size={8} className={student.isMe ? "text-emerald-500" : "text-slate-500"} />
                                                {student.points} XP
                                            </p>
                                        </div>

                                        {/* Highlight for top 3 */}
                                        {student.rank <= 3 && (
                                            <Trophy size={12} className={`ml-0.5 flex-shrink-0 ${student.rank === 1 ? 'text-amber-400' : student.rank === 2 ? 'text-slate-300' : 'text-orange-400'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BadgesPage;
