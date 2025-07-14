'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserForm({ user, onSave, loading }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prevData) => ({ ...prevData, role: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneToSave = formData.phone.startsWith('+977') ? formData.phone : `+977${formData.phone}`;
    onSave({ ...formData, phone: phoneToSave });
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone</Label>
        <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap">+977</Label>
            <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="98XXXXXXXX"
                value={formData.phone.startsWith('+977') ? formData.phone.substring(4) : formData.phone}
                onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 10) {
                        setFormData((prevData) => ({ ...prevData, phone: value }));
                    }
                }}
                required
                maxLength={10}
                minLength={10}
                pattern="^\d{10}$"
                title="Please enter a 10-digit Nepali phone number (e.g., 98XXXXXXXX)"
            />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" value={formData.role} onValueChange={handleRoleChange}>
            <SelectTrigger>
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
        </Select>
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
