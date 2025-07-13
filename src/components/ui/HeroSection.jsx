
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Input } from './input';

async function getRecentPosts() {
    const res = await fetch('/api/news', {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    const data = await res.json();
    return data.slice(0, 5);
}

export default function HeroSection() {
    const [posts, setPosts] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState('');

    useEffect(() => {
        getRecentPosts().then(setPosts).catch(console.error);
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setSubscribing(true);
        setSubscribeMessage('');

        try {
            const res = await fetch('/api/notice-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, email }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubscribeMessage('Subscribed successfully!');
                setPhoneNumber('');
                setEmail('');
            } else {
                setSubscribeMessage(data.message || 'Subscription failed.');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setSubscribeMessage('An error occurred during subscription.');
        } finally {
            setSubscribing(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <section className="py-12">
            <div className="container mx-auto text-red-800">
                <motion.h2 
                    className="text-3xl font-bold mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Recent Posts
                </motion.h2>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {posts.map((post) => (
                        <motion.div key={post._id} variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{post.content.substring(0, 100)}...</p>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild>
                                        <Link href={`/posts/${post._id}`}>Read More</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
                <motion.div 
                    className="text-center mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Button asChild>
                        <Link href="/posts">View All Posts</Link>
                    </Button>
                </motion.div>

                <motion.div
                    className="mt-12 p-6 bg-gray-100 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">Subscribe to Notice SMS</h3>
                    <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4">
                        <Input
                            type="tel"
                            placeholder="Phone Number (required)"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="flex-grow"
                        />
                        <Input
                            type="email"
                            placeholder="Email (optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={subscribing}>
                            {subscribing ? "Subscribing..." : "Subscribe"}
                        </Button>
                    </form>
                    {subscribeMessage && (
                        <p className="mt-4 text-center text-sm font-medium"
                           style={{ color: subscribeMessage.includes("successfully") ? "green" : "red" }}>
                            {subscribeMessage}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
