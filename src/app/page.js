'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, noticesRes] = await Promise.all([
          fetch('/api/news'),
          fetch('/api/notice'),
        ]);

        if (!postsRes.ok) throw new Error('Failed to fetch posts');
        if (!noticesRes.ok) throw new Error('Failed to fetch notices');

        const postsData = await postsRes.json();
        const noticesData = await noticesRes.json();

        setPosts(postsData.slice(0, 5)); // Display top 5 recent posts
        setNotices(noticesData.slice(0, 5)); // Display top 5 recent notices
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-4">Recent Posts</h2>
        {posts.length === 0 ? (
          <p>No recent posts available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post._id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">By {post.author?.username || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3">{post.content}</p>
                  <Button variant="link" asChild className="px-0 mt-2">
                    <Link href={`/posts/${post._id}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center mt-6">
          <Button asChild>
            <Link href="/posts">View All Posts</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">Recent Notices</h2>
        {notices.length === 0 ? (
          <p>No recent notices available.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <div className="text-center mt-6">
          <Button asChild>
            <Link href="/notices">View All Notices</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}