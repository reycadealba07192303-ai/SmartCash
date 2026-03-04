import React, { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { BookOpen, Calendar, User, ArrowRight, Tag, Loader2, Sparkles, X, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BlogPageProps {
    role?: 'student' | 'teacher' | 'admin';
}

const BlogPage: React.FC<BlogPageProps> = ({ role = 'student' }) => {
    const { token } = useAuth();
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!token) { setLoading(false); return; }
            try {
                setIsGenerating(true);
                const res = await fetch('https://smartcash-x4j5.onrender.com/api/ai/blog-posts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setBlogPosts(await res.json());
            } catch (err) {
                console.error('Failed to fetch blog posts', err);
            } finally {
                setLoading(false);
                setIsGenerating(false);
            }
        };
        fetchPosts();
    }, [token]);

    // Close modal on Escape key
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedPost(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    if (loading) {
        return (
            <DashboardLayout role={role}>
                <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <Loader2 className="animate-spin text-emerald-500" size={48} />
                        <Sparkles className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" size={18} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {isGenerating ? 'AI is writing your financial literacy articles...' : 'Loading...'}
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role={role}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Financial Literacy Blog</h1>
                    <p className="text-slate-500 dark:text-slate-400">Stay updated with the latest tips and strategies for managing your finances.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-slate-500">
                            No articles published yet. Check back soon!
                        </div>
                    )}
                    {blogPosts.map((post) => (
                        <article
                            key={post._id || post.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer"
                            onClick={() => setSelectedPost(post)}
                        >
                            <div className="h-48 overflow-hidden relative bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                                {post.image_url ? (
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <BookOpen size={48} className="text-emerald-300 dark:text-slate-600" />
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-sm flex items-center gap-1.5">
                                    <Tag size={12} />
                                    {post.category}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        {new Date(post.createdAt || Date.now()).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} />
                                        {post.author_name || 'SmartCash AI'}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                                        className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all"
                                    >
                                        Read Article
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Article Reader Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 overflow-y-auto"
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl my-auto animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="relative h-56 rounded-t-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 flex items-end p-8">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=800&q=60")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <div className="relative z-10 flex-1">
                                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                    <Tag size={11} />
                                    {selectedPost.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                                    {selectedPost.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-5 px-8 py-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 font-semibold">
                                <User size={13} />
                                {selectedPost.author_name || 'SmartCash AI'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={13} />
                                {new Date(selectedPost.createdAt || Date.now()).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={13} />
                                {selectedPost.read_time_minutes || 5} min read
                            </span>
                        </div>

                        {/* Content */}
                        <div className="px-8 py-8">
                            <p className="text-base text-emerald-700 dark:text-emerald-400 font-semibold italic mb-6 leading-relaxed border-l-4 border-emerald-400 pl-4">
                                {selectedPost.excerpt}
                            </p>
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                {(selectedPost.content || '').split('\n').filter((p: string) => p.trim()).map((paragraph: string, idx: number) => (
                                    <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 text-[15px]">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end rounded-b-3xl">
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                            >
                                Close Article
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default BlogPage;
