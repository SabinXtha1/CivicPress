'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredPosts, setFeaturedPosts] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

        setNotices(noticesData.slice(0, 1)); // Display only the most recent notice
        setFeaturedPosts(postsData.filter(post => post.isFeatured).slice(0, 5)); // Display top 5 featured posts

        // Request notification permission and send notification for new notice
        if (noticesData.length > 0) {
          const latestNotice = noticesData[0];
          const lastNotifiedNoticeId = localStorage.getItem('lastNotifiedNoticeId');

          if (latestNotice._id !== lastNotifiedNoticeId) {
            if (Notification.permission === "granted") {
              new Notification("New Notice!", {
                body: latestNotice.title,
              });
              localStorage.setItem('lastNotifiedNoticeId', latestNotice._id);
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  new Notification("New Notice!", {
                    body: latestNotice.title,
                  });
                  localStorage.setItem('lastNotifiedNoticeId', latestNotice._id);
                }
              });
            }
          }
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (featuredPosts.length > 0 && !isDragging) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [featuredPosts, currentIndex, isDragging]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2; // The * 2 is for a faster scroll
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <section className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-lg mb-8 overflow-hidden">
        {notices.length === 0 ? (
          <p className="text-center">No recent notices available.</p>
        ) : (
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-lg font-semibold">Latest Notice:</span> {notices[0].title}
          </div>
        )}
      </section>

      <section className="relative w-full overflow-hidden rounded-lg shadow-lg mb-8">
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {featuredPosts.map((post) => (
            <div key={post._id} className="w-full flex-shrink-0">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
                  <Button asChild>
                    <Link href={`/posts/${post._id}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {featuredPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 w-2 rounded-full ${currentIndex === idx ? 'bg-white' : 'bg-gray-400'}`}
            ></button>
          ))}
        </div>
      </section>

      

      
    </div>
  );
}