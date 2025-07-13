'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'react-hot-toast';

export default function NoticesPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    const [newNoticeTitle, setNewNoticeTitle] = useState('');
    const [newNoticeImage, setNewNoticeImage] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchNotices = async () => {
        try {
            const res = await fetch('/api/notice');
            if (!res.ok) throw new Error('Failed to fetch notices');
            const data = await res.json();
            setNotices(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('You must be logged in to create a notice.');
            return;
        }
        if (!user || user.role !== 'admin') {
            toast.error('You do not have permission to create a notice.');
            return;
        }

        try {
            const res = await fetch('/api/notice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: newNoticeTitle,
                    image: newNoticeImage,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Notice created successfully!');
                setNewNoticeTitle('');
                setNewNoticeImage('');
                setIsDialogOpen(false);
                fetchNotices(); // Refresh notices list
            } else {
                throw new Error(data.message || 'Failed to create notice');
            }
        } catch (err) {
            console.error('Error creating notice:', err);
            toast.error(err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Loading notices...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <Toaster position="bottom-right" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">All Notices</h1>
                {(user && user.role === 'admin') && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Create New Notice</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Notice</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateNotice} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={newNoticeTitle}
                                        onChange={(e) => setNewNoticeTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input
                                        id="image"
                                        value={newNoticeImage}
                                        onChange={(e) => setNewNoticeImage(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">Create Notice</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {notices.length === 0 ? (
                <p>No notices available.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notices.map((notice) => (
                        <Card key={notice._id}>
                            <CardHeader>
                                <CardTitle>{notice.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString()}</p>
                            </CardHeader>
                            {notice.image && (
                                <CardContent>
                                    <img src={notice.image} alt={notice.title} className="w-full h-48 object-cover rounded-md" />
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
