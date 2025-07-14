'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImages, setNewPostImages] = useState('');
    const [newPostFeatured, setNewPostFeatured] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/news');
            if (!res.ok) throw new Error('Failed to fetch posts');
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('You must be logged in to create a post.');
            return;
        }
        if (!user || (user.role !== 'admin' && user.role !== 'user')) {
            toast.error('You do not have permission to create a post.');
            return;
        }

        try {
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: newPostTitle,
                    content: newPostContent,
                    images: newPostImages.split(',').map(img => img.trim()).filter(img => img !== ''),
                    featured: newPostFeatured,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Post created successfully!');
                setNewPostTitle('');
                setNewPostContent('');
                setNewPostImages('');
                setNewPostFeatured(false);
                setIsDialogOpen(false);
                fetchPosts(); // Refresh posts list
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (err) {
            console.error('Error creating post:', err);
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">All Posts</h1>
                    <Button size="icon" disabled>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
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
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/4" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-8 p-4">
            <Toaster position="bottom-right" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">All Posts</h1>
                {(user && (user.role === 'admin' || user.role === 'user')) && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" title="Create New Post">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Post</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new post.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreatePost} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="images">Image URLs (comma-separated)</Label>
                                    <Input
                                        id="images"
                                        value={newPostImages}
                                        onChange={(e) => setNewPostImages(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="featured"
                                        checked={newPostFeatured}
                                        onCheckedChange={setNewPostFeatured}
                                    />
                                    <Label htmlFor="featured">Featured Post</Label>
                                </div>
                                <Button type="submit">Create Post</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {posts.length === 0 ? (
                <p>No posts available.</p>
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
                                    <p className="text-sm text-muted-foreground">By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</p>
                                </CardHeader>
                                <CardContent>
                                    {post.images && post.images.length > 0 && (
                                        <img src={post.images[0]} alt={post.title} className="w-full h-48 object-cover rounded-md mb-4" />
                                    )}
                                    <p className="text-sm line-clamp-3">{post.content}</p>
                                    <Button variant="link" asChild className="px-0 mt-2">
                                        <Link href={`/posts/${post._id}`}>Read More</Link>
                                    </Button>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span>{post.likes.length} Likes</span>
                                        <span>{post.comments.length} Comments</span>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}