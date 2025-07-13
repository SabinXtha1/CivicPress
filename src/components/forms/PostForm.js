'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function PostForm({ post, onSave, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: '', // Changed to string for comma-separated URLs
    featured: false,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        images: post.images ? post.images.join(', ') : '', // Join array to string
        featured: post.featured || false,
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      images: formData.images.split(',').map(url => url.trim()).filter(url => url), // Split string back to array
    };
    onSave(dataToSave);
  };

  return (
    <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Input
          id="images"
          type="text"
          name="images"
          value={formData.images}
          onChange={handleChange}
          placeholder="e.g., http://example.com/img1.jpg, http://example.com/img2.png"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
            id="featured"
            name="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
        />
        <Label htmlFor="featured">Featured</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? (
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
                <Loader2 className="h-4 w-4" />
            </motion.div>
        ) : (
            "Save"
        )}
      </Button>
    </motion.form>
  );
}
