'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PostForm from '@/components/forms/PostForm';
import Link from 'next/link';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster, toast } from 'react-hot-toast';

export default function MyPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token, loading: authLoading } = useAuth();
    const router = useRouter();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentEditingPost, setCurrentEditingPost] = useState(null);

    const fetchMyPosts = async () => {
        if (!token || !user) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`/api/news?authorId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch your posts');
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login'); // Redirect if not logged in and auth has finished loading
            return;
        }
        if (user && !authLoading) {
            fetchMyPosts();
        }
    }, [user, token, router, authLoading]);

    const handleEditClick = (postToEdit) => {
        setCurrentEditingPost(postToEdit);
        setIsEditDialogOpen(true);
    };

    const handleUpdatePost = async (updatedPostData) => {
        if (!currentEditingPost || !token) return;

        try {
            const res = await fetch(`/api/news/${currentEditingPost._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedPostData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Post updated successfully!');
                setIsEditDialogOpen(false);
                fetchMyPosts(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to update post');
            }
        } catch (err) {
            console.error('Error updating post:', err);
            toast.error(err.message);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        if (!token) return;

        try {
            const res = await fetch(`/api/news/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                alert('Post deleted successfully!');
                fetchMyPosts(); // Refresh list
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete post');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            toast.error(err.message);
        }
    };

    if (authLoading) {
        return <div className="text-center py-8">Loading authentication...</div>;
    }

    if (!user) {
        return <div className="text-center py-8">Please log in to view your posts.</div>;
    }

    if (loading) {
        return (
            <div className="space-y-8 p-4">
                <h1 className="text-4xl font-bold mb-6">My Posts</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-48 w-full mb-4" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-5/6 mb-4" />
                                <div className="flex space-x-2">
                                    <Skeleton className="h-10 w-20" />
                                    <Skeleton className="h-10 w-20" />
                                    <Skeleton className="h-10 w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-8 p-4">
            <Toaster position="bottom-right" />
            <h1 className="text-4xl font-bold mb-6">My Posts</h1>

            {posts.length === 0 ? (
                <p>You haven't created any posts yet.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>{post.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">Created on {new Date(post.createdAt).toLocaleDateString()}</p>
                                </CardHeader>
                                <CardContent>
                                    {post.images && post.images.length > 0 && (
                                        <img src={post.images[0]} alt={post.title} className="w-full h-48 object-cover rounded-md mb-4" />
                                    )}
                                    <p className="text-sm line-clamp-3">{post.content}</p>
                                    <div className="flex space-x-2 mt-4">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(post)} title="Edit Post">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeletePost(post._id)} title="Delete Post">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="link" asChild className="px-0">
                                            <Link href={`/posts/${post._id}`}>View</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {currentEditingPost && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>Edit Post</DialogTitle>
                            <DialogDescription>
                                Make changes to your post here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <PostForm post={currentEditingPost} onSave={handleUpdatePost} />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
