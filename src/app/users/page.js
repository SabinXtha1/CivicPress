'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
            router.push('/'); // Redirect if not authorized
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch users');
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, token, router]);

    if (loading) return <div className="text-center py-8">Loading users...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold mb-6">All Users</h1>

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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
