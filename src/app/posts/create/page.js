'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PostForm from '@/components/forms/PostForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Toaster, toast } from 'react-hot-toast';

export default function CreatePostPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreatePost = async (formData) => {
        if (!token) {
            toast.error('You must be logged in to create a post.');
            router.push('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Post created successfully!');
                router.push('/posts/my-posts'); // Redirect to my posts page
            } else {
                throw new Error(data.message || 'Failed to create post');
            }
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="text-center py-8">Please log in to create a post.</div>;
    }

    return (
        <div className="space-y-8">
            <Toaster position="bottom-right" />
            <h1 className="text-4xl font-bold mb-6">Create New Post</h1>
            <Card>
                <CardHeader>
                    <CardTitle>New Post Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <PostForm onSave={handleCreatePost} />
                </CardContent>
            </Card>
            {loading && <div className="text-center py-4">Creating post...</div>}
            {error && <div className="text-center py-4 text-red-500">Error: {error}</div>}
        </div>
    );
}
