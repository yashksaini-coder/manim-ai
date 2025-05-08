'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { ArrowLeft, Check, PlayCircle, Repeat } from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: string;
  value: string;
  type: 'USER' | 'SYSTEM';
  videoUrl: string | null;
  createdAt: string;
}

export default function PromptDetailPage({ 
  params 
}: { 
  params: { id: string; promptId: string } 
}) {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/projects');
      return;
    }

    if (isLoaded && isSignedIn && params.id && params.promptId) {
      fetchPromptDetails();
    }
  }, [isLoaded, isSignedIn, params.id, params.promptId]);

  const fetchPromptDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${params.id}/prompts/${params.promptId}`);
      setPrompt(response.data);
    } catch (error) {
      console.error('Error fetching prompt details:', error);
      setError('Failed to load prompt details');
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    try {
      setGenerating(true);
      setError('');
      const response = await axios.post(`/api/projects/${params.id}/prompts/${params.promptId}`);
      setPrompt(response.data);
    } catch (error) {
      console.error('Error generating video:', error);
      setError('Failed to generate video');
    } finally {
      setGenerating(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="mb-4 text-lg text-red-500">{error}</p>
        <Link 
          href={`/projects/${params.id}`} 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Project
        </Link>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="mb-4 text-lg">Prompt not found</p>
        <Link 
          href={`/projects/${params.id}`} 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Project
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link 
          href={`/projects/${params.id}`} 
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span>Back to Project</span>
        </Link>
        
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-muted px-2 py-1 text-xs">
            {prompt.type === 'USER' ? 'User Prompt' : 'System Prompt'}
          </span>
          <span className="text-xs text-muted-foreground">
            Created {new Date(prompt.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold">Prompt Detail</h1>
      </div>

      <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Prompt</h2>
        <p className="whitespace-pre-wrap">{prompt.value}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Animation</h2>
        
        {prompt.videoUrl ? (
          <div className="space-y-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <video 
                src={prompt.videoUrl} 
                controls
                className="h-full w-full object-contain"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={generateVideo}
                disabled={generating}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Repeat size={16} />
                <span>{generating ? 'Regenerating...' : 'Regenerate Animation'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <p className="text-muted-foreground">No animation has been generated yet</p>
            
            <button
              onClick={generateVideo}
              disabled={generating}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary-foreground"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <PlayCircle size={16} />
                  <span>Generate Animation</span>
                </>
              )}
            </button>
            
            {generating && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">This may take a few minutes</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check size={12} className="text-green-500" />
                    <span>Analyzing prompt</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                    <span>Generating animations</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 