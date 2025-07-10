'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import NoticeForm from '@/components/forms/NoticeForm';

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
                alert('Notice updated successfully!');
                setIsEditDialogOpen(false);
                fetchNotices(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to update notice');
            }
        } catch (err) {
            console.error('Error updating notice:', err);
            alert(err.message);
        }
    };

    const handleCreateNotice = async (formData) => {
        if (!token) return;

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
                alert('Notice created successfully!');
                setIsCreateDialogOpen(false);
                fetchNotices(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to create notice');
            }
        } catch (err) {
            console.error('Error creating notice:', err);
            alert(err.message);
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
            console.error('Error deleting notice:', err);
            alert(err.message);
        }
    };

    if (loading || !user || user.role !== 'admin') {
        return <div className="text-center py-8">Loading or unauthorized...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Manage Notices</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Create New Notice</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Notice</DialogTitle>
                        </DialogHeader>
                        <NoticeForm onSave={handleCreateNotice} />
                    </DialogContent>
                </Dialog>
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
                                    <img src={notice.image} alt={notice.title} className="w-full h-48 object-cover rounded-md mb-4" />
                                </CardContent>
                            )}
                            <CardContent>
                                <div className="flex space-x-2 mt-4">
                                    <Button variant="outline" onClick={() => handleEditClick(notice)}>Edit</Button>
                                    <Button variant="destructive" onClick={() => handleDeleteNotice(notice._id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {currentEditingNotice && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
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
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
