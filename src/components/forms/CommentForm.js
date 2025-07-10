'use client';

import { useState } from 'react';

export default function CommentForm({ onSave }) {
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState(''); // This should be the user's ID

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ comment, author });
    setComment('');
    setAuthor('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium">Author ID</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Add Comment
      </button>
    </form>
  );
}
