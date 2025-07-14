"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight, Eye, Calendar, Users } from "lucide-react"


async function getRecentPosts() {
  const res = await fetch("/api/news", {
    cache: "no-store",
  })
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch posts");
  }
  const data = await res.json()
  return data.slice(0, 6)
}

export default function HeroSection() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getRecentPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced stagger
        delayChildren: 0,    // Removed initial delay
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3, // Reduced individual animation duration
        ease: "easeOut",
      },
    },
  }

  const cardHoverVariants = {
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-gray-50 to-white py-16 border-b border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-black mb-6"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Stay Informed
            </motion.h1>
            <motion.p
              className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Get the latest news and updates delivered straight to your phone
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white group">
                <Link href="/posts">
                  Explore All Posts
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Recent Posts Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-center mb-12 text-black"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Recent Posts
            </motion.h2>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-500 text-lg">Loading posts...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  className="text-center py-12 text-red-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p>Error loading posts: {error}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                >
                  {posts.map((post, index) => (
                    <motion.div key={post._id} variants={itemVariants} whileHover="hover">
                      <motion.div variants={cardHoverVariants}>
                        <Card className="hover:shadow-xl transition-shadow duration-300 border-gray-200 bg-white h-full">
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-black line-clamp-2 flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-1 text-gray-500 flex-shrink-0" />
                              {post.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 line-clamp-3">{post.content.substring(0, 150)}...</p>
                          </CardContent>
                          <CardFooter>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full border-gray-300 text-black hover:bg-gray-50 bg-transparent group"
                            >
                              <Link href={`/posts/${post._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Read More
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-gray-300 text-black hover:bg-gray-50 bg-transparent group"
              >
                <Link href="/posts">
                  <Users className="mr-2 h-4 w-4" />
                  View All Posts
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      
    </div>
  )
}
