import React, { useState, useEffect } from 'react';
import DashboardLayout from '../dashboard/DashboardLayout';
import { MessageSquare, ThumbsUp, Trash2, CheckCircle, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface ForumPost {
    id: string;
    title: string;
    content: string;
    is_flagged: boolean;
    created_at: string;
    profiles?: { full_name: string };
}

const FacultyDiscussionsPage: React.FC = () => {
    const { token } = useAuth();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('https://smartcash-x4j5.onrender.com/api/faculty/discussions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch discussions');
            const data = await res.json();
            setPosts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [token]);

    const handleToggleFlag = async (id: string, currentFlagStatus: boolean) => {
        try {
            const res = await fetch(`https://smartcash-x4j5.onrender.com/api/faculty/discussions/${id}/flag`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isFlagged: !currentFlagStatus })
            });
            if (!res.ok) throw new Error('Failed to update flag status');
            await fetchPosts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this post?')) return;
        try {
            const res = await fetch(`https://smartcash-x4j5.onrender.com/api/faculty/discussions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete post');
            await fetchPosts();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <DashboardLayout role="teacher">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Discussion Moderation</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and manage student forum posts.</p>
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center gap-4">
                            <AlertCircle />
                            <span className="font-bold">{error}</span>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">No discussion posts found.</div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border ${post.is_flagged ? 'border-red-200 dark:border-red-900/50 ring-1 ring-red-500/20' : 'border-slate-200/50 dark:border-slate-800/50'} p-6 shadow-sm hover:shadow-md transition-all`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 text-sm">
                                            {(post.profiles?.full_name || 'U').charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-900 dark:text-white block">{post.profiles?.full_name || 'Unknown User'}</span>
                                            <span className="text-xs text-slate-500">{new Date(post.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {post.is_flagged && (
                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wide">
                                            <AlertTriangle size={14} /> Flagged
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{post.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 whitespace-pre-wrap">{post.content}</p>

                                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                    <button
                                        onClick={() => handleToggleFlag(post.id, post.is_flagged)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${post.is_flagged ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                    >
                                        {post.is_flagged ? 'Unflag / Ignore' : 'Flag as Inappropriate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-bold transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={16} /> Remove Post
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FacultyDiscussionsPage;
