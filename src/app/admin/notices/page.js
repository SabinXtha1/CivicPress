'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import NoticeForm from '@/components/forms/NoticeForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit, Trash, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNoticesPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();
    const router = useRouter();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentEditingNotice, setCurrentEditingNotice] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editImage, setEditImage] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotices = async () => {
        if (!token) return;
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
        if (!user || user.role !== 'admin') {
            router.push('/'); // Redirect if not authorized
            return;
        }
        fetchNotices();
    }, [user, token, router]);

    const handleEditClick = (noticeToEdit) => {
        setCurrentEditingNotice(noticeToEdit);
        setEditTitle(noticeToEdit.title);
        setEditImage(noticeToEdit.image || '');
        setIsEditDialogOpen(true);
    };

    const handleUpdateNotice = async (e) => {
        e.preventDefault();
        if (!currentEditingNotice || !token) return;
        setIsSubmitting(true);

        try {
            const updates = {
                title: editTitle,
                image: editImage,
            };

            const res = await fetch(`/api/notice/${currentEditingNotice._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Notice updated successfully!');
                setIsEditDialogOpen(false);
                fetchNotices(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to update notice');
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateNotice = async (formData) => {
        if (!token) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/notice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Notice created successfully!');
                setIsCreateDialogOpen(false);
                fetchNotices(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to create notice');
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNotice = async (noticeId) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        if (!token) return;

        try {
            const res = await fetch(`/api/notice/${noticeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                alert('Notice deleted successfully!');
                fetchNotices(); // Refresh list
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete notice');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="text-center py-8">Unauthorized access.</div>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold">Manage Notices</h1>
                        <Button size="icon" disabled>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="bg-white dark:bg-gray-950">
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-48 w-full mb-4" />
                                    <div className="flex space-x-2">
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold">Manage Notices</h1>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" title="Create New Notice">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-950">
                            <DialogHeader>
                                <DialogTitle>Create New Notice</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new notice.
                                </DialogDescription>
                            </DialogHeader>
                            <NoticeForm onSave={handleCreateNotice} loading={isSubmitting} />
                        </DialogContent>
                    </Dialog>
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
                                    <CardTitle>{notice.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{new Date(notice.createdAt).toLocaleDateString()}</p>
                                </CardHeader>
                                {notice.image && (
                                    <CardContent>
                                        <img src={notice.image} alt={notice.title} className="w-full h-48 object-cover rounded-md mb-4" />
                                    </CardContent>
                                )}
                                <CardContent>
                                    <div className="flex space-x-2 mt-4">
                                        <Button variant="outline" size="icon" onClick={() => handleEditClick(notice)} title="Edit Notice">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDeleteNotice(notice._id)} title="Delete Notice">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {currentEditingNotice && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-950">
                        <DialogHeader>
                            <DialogTitle>Edit Notice</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateNotice} className="grid gap-4 py-4">
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
                                <Label htmlFor="editImage">Image URL</Label>
                                <Input
                                    id="editImage"
                                    value={editImage}
                                    onChange={(e) => setEditImage(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
        </div>

    );
}
