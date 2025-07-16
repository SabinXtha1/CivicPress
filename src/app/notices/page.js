'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription  } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function NoticesPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    const [newNoticeTitle, setNewNoticeTitle] = useState('');
    const [newNoticeImage, setNewNoticeImage] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

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
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 px-6">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold">All Notices</h1>
                        {(user && user.role === 'admin') && (
                            <Button size="icon" disabled>
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="bg-white dark:bg-gray-950">
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-48 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">All Notices</h1>
                    {(user && user.role === 'admin') && (
                        <Button size="icon" title="Create New Notice" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>

            {(user && user.role === 'admin') && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-950">
                        <DialogHeader>
                            <DialogTitle>Create New Notice</DialogTitle>
                            <DialogDescription>
                                Fill in the details to create a new notice.
                            </DialogDescription>
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Notice"}
                            </Button>
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
                        <motion.div
                            key={notice._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="bg-white dark:bg-gray-950">
                                <CardHeader>
                                    <CardTitle >{notice.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                </CardHeader>
                                {notice.image && (
                                    <CardContent>
                                        <img src={notice.image} alt={notice.title} className="w-full h-48 object-cover rounded-md" />
                                    </CardContent>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
