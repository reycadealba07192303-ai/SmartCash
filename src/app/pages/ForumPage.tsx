import React, { useState, useEffect } from 'react';
import DashboardLayout from './dashboard/DashboardLayout';
import { MessageSquare, Heart, MessageCircle, Share2, Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

const ForumPage: React.FC = () => {
    const { token, user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [comments, setComments] = useState<{ [key: string]: any[] }>({});
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            if (!token) return;
            try {
                const res = await fetch('http://localhost:5000/api/student/forum/posts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (err) {
                console.error('Failed to fetch forum posts', err);
            }
        };
        fetchPosts();

        const socket = io('http://localhost:5000');

        socket.on('new_forum_post', (newPost: any) => {
            setPosts(prevPosts => [newPost, ...prevPosts]);
        });

        socket.on('new_forum_comment', (newComment: any) => {
            setComments(prev => {
                const postComments = prev[newComment.post_id] || [];
                // Check if comment already exists (if we're the one who posted it, we might already have it)
                if (postComments.some(c => c._id === newComment._id)) {
                    return prev;
                }
                return {
                    ...prev,
                    [newComment.post_id]: [...postComments, newComment]
                };
            });
            // Update comments_count in posts state
            setPosts(prevPosts => prevPosts.map(p =>
                (p._id || p.id) === newComment.post_id
                    ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                    : p
            ));
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });

    const handlePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.title || !newPost.content) return;

        setIsCreating(false);
        const postData = { ...newPost, tags: ['General'] };
        setNewPost({ title: '', content: '' });

        if (token) {
            try {
                await fetch('http://localhost:5000/api/student/forum/post', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });
                // Note: We don't manually add to state. Socket.IO broadcasts it.
            } catch (err) {
                console.error('Failed to register forum post', err);
            }
        }
    };

    const handleLike = async (postId: string) => {
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:5000/api/student/forum/posts/${postId}/like`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPosts(prev => prev.map(p =>
                    (p._id || p.id) === postId ? { ...p, likes: data.likes, likedByMe: data.hasLiked } : p
                ));
            }
        } catch (error) {
            console.error('Error liking post', error);
        }
    };

    const handleToggleComments = async (postId: string) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
            return;
        }

        setActiveCommentPostId(postId);

        if (!comments[postId] && token) {
            try {
                const res = await fetch(`http://localhost:5000/api/student/forum/posts/${postId}/comments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setComments(prev => ({ ...prev, [postId]: data }));
                }
            } catch (error) {
                console.error('Error fetching comments', error);
            }
        }
    };

    const handleAddComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!commentContent.trim() || !token) return;

        try {
            const res = await fetch(`http://localhost:5000/api/student/forum/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: commentContent })
            });

            if (res.ok) {
                setCommentContent('');
            }
        } catch (error) {
            console.error('Error submitting comment', error);
        }
    };

    const handleShare = (post: any) => {
        const url = `${window.location.origin}/dashboard/student/forum?post=${post._id || post.id}`;
        navigator.clipboard.writeText(url)
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => console.error('Failed to copy', err));
    };

    return (
        <DashboardLayout role="student">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Community Forum</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Discuss ideas, share tips, and learn from other ABM students.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20"
                    >
                        <Plus size={20} />
                        New Post
                    </button>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Feed */}
                    <div className="flex-1 space-y-6">
                        {isCreating && (
                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-xl animate-in slide-in-from-top-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create a Discussion</h3>
                                <form onSubmit={handlePostSubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Title of your discussion"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                    />
                                    <textarea
                                        placeholder="What's on your mind?"
                                        rows={4}
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    ></textarea>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {posts.map(post => (
                            <div key={post._id || post.id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 overflow-hidden text-sm uppercase">
                                        {post.author_avatar ? (
                                            <img src={post.author_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            post.author_name?.charAt(0) || 'S'
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{post.author_name}</h4>
                                        <p className="text-xs text-slate-500">{new Date(post.createdAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{post.content}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {post.tags?.map((tag: string) => (
                                        <span key={tag} className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => handleLike(post._id || post.id)}
                                            className={`flex items-center gap-2 transition-colors text-sm font-medium ${post.likedByMe || (user && post.likedBy?.includes(user._id))
                                                    ? 'text-red-500'
                                                    : 'text-slate-500 hover:text-red-500'
                                                }`}
                                        >
                                            <Heart size={18} fill={post.likedByMe || (user && post.likedBy?.includes(user._id)) ? 'currentColor' : 'none'} /> {post.likes}
                                        </button>
                                        <button
                                            onClick={() => handleToggleComments(post._id || post.id)}
                                            className={`flex items-center gap-2 transition-colors text-sm font-medium ${activeCommentPostId === (post._id || post.id) ? 'text-blue-500' : 'text-slate-500 hover:text-blue-500'
                                                }`}
                                        >
                                            <MessageCircle size={18} /> {post.comments_count || 0}
                                        </button>
                                    </div>
                                    <button onClick={() => handleShare(post)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <Share2 size={18} />
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {activeCommentPostId === (post._id || post.id) && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50 animate-in slide-in-from-top-4">
                                        <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {(!comments[post._id || post.id] || comments[post._id || post.id].length === 0) ? (
                                                <p className="text-slate-500 text-sm text-center py-4">No comments yet. Be the first to start the discussion!</p>
                                            ) : (
                                                comments[post._id || post.id].map(comment => (
                                                    <div key={comment._id} className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden">
                                                            {comment.author_id?.avatar_url ? (
                                                                <img src={comment.author_id.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                comment.author_id?.full_name?.charAt(0) || 'U'
                                                            )}
                                                        </div>
                                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 flex-1 shadow-sm">
                                                            <div className="flex items-baseline justify-between mb-1">
                                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{comment.author_id?.full_name || 'User'}</span>
                                                                <span className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-slate-600 dark:text-slate-300 text-sm">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <form onSubmit={(e) => handleAddComment(e, post._id || post.id)} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!commentContent.trim()}
                                                className="bg-emerald-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                            >
                                                <Share2 size={16} className="-ml-0.5" />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm sticky top-6">
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search topics..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                            </div>

                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Popular Topics</h3>
                            <div className="space-y-2">
                                {['Entrepreneurship', 'Budgeting', 'Investing', 'School Life', 'Success Stories'].map(topic => (
                                    <a key={topic} href="#" className="block p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors">
                                        # {topic}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ForumPage;
