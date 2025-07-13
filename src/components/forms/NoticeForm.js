'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NoticeForm({ notice, onSave, loading }) {
  const [formData, setFormData] = useState({
    title: '',
    image: '',
  });

  useEffect(() => {
    if (notice) {
      setFormData(notice);
    }
  }, [notice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
        />
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
