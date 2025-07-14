'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function AdminNoticeSmsPage() {
    const { token } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [addingSubscription, setAddingSubscription] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editPhoneNumber, setEditPhoneNumber] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notice-sms', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setSubscriptions(data);
        } catch (err) {
            setError(err.message);
            toast.error(`Failed to fetch subscriptions: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSubscriptions();
        }
    }, [token]);

    const handleAddSubscription = async (e) => {
        e.preventDefault();
        setAddingSubscription(true);
        try {
            const formattedPhoneNumber = `+977${newPhoneNumber}`;
            const res = await fetch('/api/notice-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber, email: newEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Subscription added successfully!');
                setNewPhoneNumber('');
                setNewEmail('');
                fetchSubscriptions(); // Refresh the list
            } else {
                throw new Error(data.message || 'Failed to add subscription');
            }
        } catch (err) {
            toast.error(`Error adding subscription: ${err.message}`);
        } finally {
            setAddingSubscription(false);
        }
    };

    const handleEdit = (subscription) => {
        setEditingId(subscription._id);
        setEditPhoneNumber(subscription.phoneNumber);
        setEditEmail(subscription.email || '');
    };

    const handleUpdate = async (e, id) => {
        e.preventDefault();
        try {
            const formattedPhoneNumber = `+977${editPhoneNumber}`;
            const res = await fetch(`/api/notice-sms/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ phoneNumber: formattedPhoneNumber, email: editEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Subscription updated successfully!');
                setEditingId(null);
                setEditPhoneNumber('');
                setEditEmail('');
                fetchSubscriptions();
            } else {
                throw new Error(data.message || 'Failed to update subscription');
            }
        } catch (err) {
            toast.error(`Error updating subscription: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this subscription?')) {
            return;
        }
        try {
            const res = await fetch(`/api/notice-sms/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                toast.success('Subscription deleted successfully!');
                fetchSubscriptions();
            } else {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete subscription');
            }
        } catch (err) {
            toast.error(`Error deleting subscription: ${err.message}`);
        }
    };

    if (loading) return <div className="container mx-auto py-8">Loading subscriptions...</div>;
    if (error) return <div className="container mx-auto py-8 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Manage Notice SMS Subscriptions</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddSubscription} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="newPhoneNumber">Phone Number</Label>
                            <div className="flex items-center gap-2">
                                <Label className="whitespace-nowrap">+977</Label>
                                <Input
                                    id="newPhoneNumber"
                                    type="tel"
                                    placeholder="98XXXXXXXX"
                                    value={newPhoneNumber}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value) && value.length <= 10) {
                                            setNewPhoneNumber(value);
                                        }
                                    }}
                                    required
                                    maxLength={10}
                                    minLength={10}
                                    pattern="^\d{10}$"
                                    title="Please enter a 10-digit Nepali phone number (e.g., 98XXXXXXXX)"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Enter 10-digit Nepali number (e.g., 98XXXXXXXX)</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="newEmail">Email (Optional)</Label>
                            <Input
                                id="newEmail"
                                type="email"
                                placeholder="example@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={addingSubscription}>
                            {addingSubscription ? "Adding..." : "Add Subscription"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                    {subscriptions.length === 0 ? (
                        <p>No subscriptions found.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {subscriptions.map((sub) => (
                                        <tr key={sub._id}>
                                            {editingId === sub._id ? (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="whitespace-nowrap">+977</Label>
                                                        <Input
                                                            type="tel"
                                                            value={editPhoneNumber}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (/^\d*$/.test(value) && value.length <= 10) {
                                                                    setEditPhoneNumber(value);
                                                                }
                                                            }}
                                                            required
                                                            maxLength={10}
                                                            minLength={10}
                                                            pattern="^\d{10}$"
                                                            title="Please enter a 10-digit Nepali phone number (e.g., 98XXXXXXXX)"
                                                        />
                                                    </div>
                                                </td>
                                            ) : (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.phoneNumber}</td>
                                            )}
                                            {editingId === sub._id ? (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <Input
                                                        type="email"
                                                        value={editEmail}
                                                        onChange={(e) => setEditEmail(e.target.value)}
                                                    />
                                                </td>
                                            ) : (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.email || 'N/A'}</td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sub.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingId === sub._id ? (
                                                    <>
                                                        <Button
                                                            onClick={(e) => handleUpdate(e, sub._id)}
                                                            className="mr-2"
                                                            size="sm"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            onClick={() => setEditingId(null)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            onClick={() => handleEdit(sub)}
                                                            className="mr-2"
                                                            size="sm"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(sub._id)}
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
