'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPromptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [formData, setFormData] = useState({
    value: '',
    type: 'USER' as 'USER' | 'SYSTEM',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.value.trim()) {
      setError('Prompt value is required');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/projects/${params.id}/prompts`, formData);
      router.push(`/projects/${params.id}`);
    } catch (err) {
      console.error('Error creating prompt:', err);
      setError('Failed to create prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8">
        <Link 
          href={`/projects/${params.id}`} 
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span>Back to Project</span>
        </Link>
        <h1 className="text-3xl font-bold">Create New Prompt</h1>
        <p className="mt-2 text-muted-foreground">
          Create a prompt to generate a Manim animation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm font-medium">
            Prompt Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'USER' | 'SYSTEM' })}
            className="w-full rounded-md border border-border bg-muted px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="USER">User Prompt</option>
            <option value="SYSTEM">System Prompt</option>
          </select>
          <p className="text-xs text-muted-foreground">
            User prompts are specific instructions for animations. System prompts set general preferences.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="value" className="block text-sm font-medium">
            Prompt Value <span className="text-red-500">*</span>
          </label>
          <textarea
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="w-full rounded-md border border-border bg-muted px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={formData.type === 'USER' 
              ? "Example: Create an animation showing a circle transforming into a square" 
              : "Example: Prefer blue and green colors, use 3D animations when possible"}
            rows={8}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
} 