'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Newspaper, Bell, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'admin' && user.role !== 'editor'))) {
            router.push('/'); // Redirect to home if not authorized
        }
    }, [user, loading, router]);

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
        return <div className="text-center py-8">Unauthorized access.</div>;
    }

    if (loading) {
        return (
            <div className="space-y-8 p-4">
                <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-4" />
                                <Skeleton className="h-10 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4">
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
            <p className="text-lg text-muted-foreground">Welcome, {user?.username}. You have {user?.role} privileges.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Posts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">View all posts or create a new one.</p>
                            <Button asChild>
                                <Link href="/admin/posts">
                                    <Newspaper className="mr-2 h-4 w-4" />
                                    Go to Posts
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Notices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">View all notices or create a new one.</p>
                            <Button asChild>
                                <Link href="/admin/notices">
                                    <Bell className="mr-2 h-4 w-4" />
                                    Go to Notices
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {user && user.role === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Users</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">View and manage user accounts.</p>
                                <Button asChild>
                                    <Link href="/admin/users">
                                        <Users className="mr-2 h-4 w-4" />
                                        Go to Users
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
