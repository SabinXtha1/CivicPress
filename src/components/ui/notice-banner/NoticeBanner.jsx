"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"

export default function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const contentRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch("/api/notice?last24Hours=true")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setNotices(data)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [])

  if (loading) return null
  if (error) return null
  if (notices.length === 0) return null

  // Create enough duplicates to ensure seamless scrolling
  const duplicatedNotices = Array(6).fill(notices).flat()

  return (
    <>
      {isVisible && (
        <div ref={containerRef} className="relative bg-indigo-600 px-4 py-3 text-white pr-16  overflow-hidden">
          <motion.div
            ref={contentRef}
            className="flex flex-nowrap whitespace-nowrap "
            animate={{
              x: [0, -100 / 6 + "%"], // Move by 1/6th since we have 6 duplicates
            }}
            transition={{
              duration: 1, 
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            {duplicatedNotices.map((notice, index) => (
              <span key={`${notice.id || notice.title}-${index}`} className="font-medium mx-8 flex-shrink-0 transition delay-150 duration-300 ease-in-out">
                {notice.title}
              </span>
            ))}
          </motion.div>
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 hover:bg-white/20 rounded-full p-1 transition-colors"
            onClick={() => setIsVisible(false)}
            aria-label="Close notice banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
