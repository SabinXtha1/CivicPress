'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminPostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();
    const router = useRouter();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentEditingPost, setCurrentEditingPost] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editImages, setEditImages] = useState('');
    const [editFeatured, setEditFeatured] = useState(false);

    const fetchPosts = async () => {
        if (!token) return;
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
        if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
            router.push('/'); // Redirect if not authorized
            return;
        }
        fetchPosts();
    }, [user, token, router]);

    const handleEditClick = (postToEdit) => {
        setCurrentEditingPost(postToEdit);
        setEditTitle(postToEdit.title);
        setEditContent(postToEdit.content);
        setEditImages(postToEdit.images.join(', '));
        setEditFeatured(postToEdit.featured);
        setIsEditDialogOpen(true);
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        if (!currentEditingPost || !token) return;

        try {
            const updates = {
                title: editTitle,
                content: editContent,
                images: editImages.split(',').map(img => img.trim()).filter(img => img !== ''),
                featured: editFeatured,
            };

            const res = await fetch(`/api/news/${currentEditingPost._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();
            if (res.ok) {
                alert('Post updated successfully!');
                setIsEditDialogOpen(false);
                fetchPosts(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to update post');
            }
        } catch (err) {
            console.error('Error updating post:', err);
            alert(err.message);
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
                fetchPosts(); // Refresh list
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete post');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            alert(err.message);
        }
    };

    if (loading || !user || (user.role !== 'admin' && user.role !== 'editor')) {
        return <div className="text-center py-8">Loading or unauthorized...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold mb-6">Manage Posts</h1>

            {posts.length === 0 ? (
                <p>No posts available.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Card key={post._id}>
                            <CardHeader>
                                <CardTitle>{post.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</p>
                            </CardHeader>
                            <CardContent>
                                {post.images && post.images.length > 0 && (
                                    <img src={post.images[0]} alt={post.title} className="w-full h-48 object-cover rounded-md mb-4" />
                                )}
                                <p className="text-sm line-clamp-3">{post.content}</p>
                                <div className="flex space-x-2 mt-4">
                                    <Button variant="outline" onClick={() => handleEditClick(post)}>Edit</Button>
                                    <Button variant="destructive" onClick={() => handleDeletePost(post._id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {currentEditingPost && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Post</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdatePost} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editTitle">Title</Label>
                                <Input
                                    id="editTitle"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editContent">Content</Label>
                                <Textarea
                                    id="editContent"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editImages">Image URLs (comma-separated)</Label>
                                <Input
                                    id="editImages"
                                    value={editImages}
                                    onChange={(e) => setEditImages(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="editFeatured"
                                    checked={editFeatured}
                                    onCheckedChange={setEditFeatured}
                                />
                                <Label htmlFor="editFeatured">Featured Post</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
