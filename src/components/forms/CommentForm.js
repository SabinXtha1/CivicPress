'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CommentForm({ onSave, loading }) {
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState(''); // This should be the user's ID

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ comment, author });
    setComment('');
    setAuthor('');
  };

  return (
    <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
      <div className="grid gap-2">
        <Label htmlFor="author">Author ID</Label>
        <Input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
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
            "Add Comment"
        )}
      </Button>
    </motion.form>
  );
}
