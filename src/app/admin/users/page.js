'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();
    const router = useRouter();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [currentEditingUser, setCurrentEditingUser] = useState(null);
    const [editUsername, setEditUsername] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editPassword, setEditPassword] = useState('');

    const fetchUsers = async () => {
        if (!token) {
            console.log("No token available, skipping fetchUsers.");
            setLoading(false);
            return;
        }
        try {
            console.log("Attempting to fetch users with token:", token);
            const res = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("Failed to fetch users, response not OK:", res.status, errorData);
                throw new Error(errorData.message || 'Failed to fetch users');
            }
            const data = await res.json();
            console.log("Successfully fetched users:", data);
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
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
        fetchUsers();
    }, [user, token, router]);

    const handleEditClick = (userToEdit) => {
        setCurrentEditingUser(userToEdit);
        setEditUsername(userToEdit.username);
        setEditEmail(userToEdit.email);
        setEditPhone(userToEdit.phone);
        setEditRole(userToEdit.role);
        setEditPassword(''); // Clear password field for security
        setIsEditDialogOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!currentEditingUser || !token) return;

        try {
            const updates = {
                username: editUsername,
                email: editEmail,
                phone: editPhone,
                role: editRole,
            };
            if (editPassword) {
                updates.password = editPassword;
            }

            const res = await fetch(`/api/user/${currentEditingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();
            if (res.ok) {
                alert('User updated successfully!');
                setIsEditDialogOpen(false);
                fetchUsers(); // Refresh list
            } else {
                throw new Error(data.message || 'Failed to update user');
            }
        } catch (err) {
            console.error('Error updating user:', err);
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        if (!token) return;

        try {
            const res = await fetch(`/api/user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                alert('User deleted successfully!');
                fetchUsers(); // Refresh list
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.message);
        }
    };

    if (loading || !user || user.role !== 'admin') {
        return <div className="text-center py-8">Loading or unauthorized...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold mb-6">Manage Users</h1>

            {users.length === 0 ? (
                <p>No users available.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((u) => (
                        <Card key={u._id}>
                            <CardHeader>
                                <CardTitle>{u.username}</CardTitle>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                            </CardHeader>
                            <CardContent>
                                <p>Role: {u.role}</p>
                                <p>Phone: {u.phone}</p>
                                <p className="text-sm text-muted-foreground">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                                <div className="flex space-x-2 mt-4">
                                    <Button variant="outline" onClick={() => handleEditClick(u)}>Edit</Button>
                                    <Button variant="destructive" onClick={() => handleDeleteUser(u._id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {currentEditingUser && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateUser} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="editUsername">Username</Label>
                                <Input
                                    id="editUsername"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editEmail">Email</Label>
                                <Input
                                    id="editEmail"
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editPhone">Phone</Label>
                                <Input
                                    id="editPhone"
                                    type="tel"
                                    value={editPhone}
                                    onChange={(e) => setEditPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editRole">Role</Label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                    <SelectTrigger id="editRole">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="editPassword">New Password (optional)</Label>
                                <Input
                                    id="editPassword"
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
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
