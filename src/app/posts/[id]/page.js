'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card, CardHeader, CardTitle, CardContent, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
  ThumbsUp, MessageCircle, Edit,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
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
    if (id) fetchPost();
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prevPost) => ({
          ...prevPost,
          likes: data.message.includes('unliked')
            ? prevPost.likes.filter((like) => like.user !== user?.id)
            : [...prevPost.likes, { user: user?.id }],
        }));
      } else {
        throw new Error(data.message || 'Failed to like/unlike post');
      }
    } catch (err) {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: id, comment: newComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prevPost) => ({
          ...prevPost,
          comments: [
            ...prevPost.comments,
            { ...data.comment, author: { username: user?.username } },
          ],
        }));
        setNewComment('');
      } else {
        throw new Error(data.message || 'Failed to add comment');
      }
    } catch (err) {
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
          Authorization: `Bearer ${token}`,
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
      toast.error(err.message);
    }
  };

  const hasLiked = post?.likes?.some((like) => like.user === user?.id);
  const canEdit = user && (user.role === 'admin' || user.role === 'editor' || user.id === post?.author?._id);

  if (loading) {
    return (
      <div className="space-y-8 p-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton className="h-64 w-full rounded-md mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-10 w-24" />
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!post) return <div className="text-center py-8">Post not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 p-4 md:p-8">
      <Toaster position="bottom-right" />

      {/* Post Card */}
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            By <span className="font-semibold">{post.author?.username || 'Unknown'}</span> on{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {post.images?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-auto h-64  rounded-lg border"
                />
              ))}
            </div>
          )}
          <p className="text-lg leading-relaxed ">{post.content}</p>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={handleLike} className={`flex items-center gap-1 ${hasLiked ? 'text-blue-600' : ''}`}>
              <ThumbsUp className="h-4 w-4" /> {post.likes.length} Likes
            </Button>
            <Button variant="ghost" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" /> {post.comments.length} Comments
            </Button>
          </div>

          {canEdit && (
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" /> Edit Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Edit Post</DialogTitle>
                  <DialogDescription>
                    Make changes to your post here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <PostForm post={post} onSave={handleEditSave} />
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      {/* Comments Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Comments</h2>

        {user && (
          <form onSubmit={handleAddComment} className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" className="px-6">
                Submit
              </Button>
            </div>
          </form>
        )}

        {post.comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-gray-200">
                  <CardContent className="pt-4 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{comment.author?.username || 'Unknown'}</p>
                      <span className="text-sm text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
