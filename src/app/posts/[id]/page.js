'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { ThumbsUp, MessageCircle, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PostForm from '@/components/forms/PostForm';
import { Toaster, toast } from 'react-hot-toast';

export default function SinglePostPage() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const { user, token } = useAuth();

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/news/${id}`);
            if (!res.ok) throw new Error('Failed to fetch post');
            const data = await res.json();
            setPost(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const handleLike = async () => {
        if (!token) {
            toast.error('You must be logged in to like a post.');
            return;
        }
        try {
            const res = await fetch('/api/news/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ postId: id }),
            });
            const data = await res.json();
            if (res.ok) {
                setPost(prevPost => ({
                    ...prevPost,
                    likes: data.message.includes('unliked')
                        ? prevPost.likes.filter(like => like.user !== user?.id)
                        : [...prevPost.likes, { user: user?.id }],
                }));
            } else {
                throw new Error(data.message || 'Failed to like/unlike post');
            }
        } catch (err) {
            console.error('Error liking/unliking post:', err);
            toast.error(err.message);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('You must be logged in to comment.');
            return;
        }
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty.');
            return;
        }

        try {
            const res = await fetch('/api/news/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ postId: id, comment: newComment }),
            });
            const data = await res.json();
            if (res.ok) {
                setPost(prevPost => ({
                    ...prevPost,
                    comments: [...prevPost.comments, { ...data.comment, author: { username: user?.username } }],
                }));
                setNewComment('');
            } else {
                throw new Error(data.message || 'Failed to add comment');
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            toast.error(err.message);
        }
    };

    const handleEditSave = async (updatedPostData) => {
        if (!token) {
            toast.error('You must be logged in to edit a post.');
            return;
        }
        try {
            const res = await fetch(`/api/news/${post._id}`, {
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
                setPost(data.post);
                setIsEditing(false);
            } else {
                throw new Error(data.message || 'Failed to update post');
            }
        } catch (err) {
            console.error('Error updating post:', err);
            toast.error(err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Loading post...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
    if (!post) return <div className="text-center py-8">Post not found.</div>;

    const hasLiked = post.likes.some(like => like.user === user?.id);
    const canEdit = user && (user.role === 'admin' || user.role === 'editor' || user.id === post.author._id);

    return (
        <div className="space-y-8">
            <Toaster position="bottom-right" />
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                    {post.images && post.images.length > 0 && (
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {post.images.map((image, index) => (
                                <img key={index} src={image} alt={`${post.title} image ${index + 1}`} className="w-full h-64 object-cover rounded-md" />
                            ))}
                        </div>
                    )}
                    <p className="text-lg leading-relaxed">{post.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={handleLike} className={hasLiked ? 'text-blue-500' : ''}>
                            <ThumbsUp className="mr-2 h-4 w-4" /> {post.likes.length} Likes
                        </Button>
                        <Button variant="ghost">
                            <MessageCircle className="mr-2 h-4 w-4" /> {post.comments.length} Comments
                        </Button>
                    </div>
                    {canEdit && (
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit Post
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Post</DialogTitle>
                                </DialogHeader>
                                <PostForm post={post} onSave={handleEditSave} />
                            </DialogContent>
                        </Dialog>
                    )}
                </CardFooter>
            </Card>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold">Comments</h2>
                {user && (
                    <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                        <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={3}
                        />
                        <Button type="submit" className="self-end">Submit Comment</Button>
                    </form>
                )}

                {post.comments.length === 0 ? (
                    <p>No comments yet. Be the first to comment!</p>
                ) : (
                    <div className="space-y-4">
                        {post.comments.map((comment) => (
                            <Card key={comment._id}>
                                <CardContent className="pt-4">
                                    <p className="font-semibold">{comment.author?.username || 'Unknown'}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                    <p className="mt-2">{comment.comment}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}