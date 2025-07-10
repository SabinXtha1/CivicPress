'use client';

import { useState, useEffect } from 'react';

export default function PostForm({ post, onSave }) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Content</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Image URLs (comma-separated)</label>
        <input
          type="text"
          name="images"
          value={formData.images}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="e.g., http://example.com/img1.jpg, http://example.com/img2.png"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          name="featured"
          checked={formData.featured}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium">Featured</label>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Save
      </button>
    </form>
  );
}
