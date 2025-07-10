'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'admin' && user.role !== 'editor'))) {
            router.push('/'); // Redirect to home if not authorized
        }
    }, [user, loading, router]);

    if (loading || !user || (user.role !== 'admin' && user.role !== 'editor')) {
        return <div className="text-center py-8">Loading or unauthorized...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
            <p className="text-lg text-muted-foreground">Welcome, {user?.username}. You have {user?.role} privileges.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">View all posts or create a new one.</p>
                        <Button asChild>
                            <Link href="/admin/posts">Go to Posts</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Manage Notices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">View all notices or create a new one.</p>
                        <Button asChild>
                            <Link href="/admin/notices">Go to Notices</Link>
                        </Button>
                    </CardContent>
                </Card>

                {user && user.role === 'admin' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">View and manage user accounts.</p>
                            <Button asChild>
                                <Link href="/admin/users">Go to Users</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
