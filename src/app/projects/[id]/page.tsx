'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import { ArrowLeft, Plus, PlayCircle, Settings, Trash } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface Prompt {
  id: string;
  value: string;
  type: 'USER' | 'SYSTEM';
  videoUrl: string | null;
  createdAt: string;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/projects');
      return;
    }

    if (isLoaded && isSignedIn && params.id) {
      fetchProjectDetails();
    }
  }, [isLoaded, isSignedIn, params.id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${params.id}`);
      setProject(response.data.project);
      setPrompts(response.data.prompts || []);
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
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
          href="/projects" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="mb-4 text-lg">Project not found</p>
        <Link 
          href="/projects" 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link 
          href="/projects" 
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-muted-foreground">{project.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-1 rounded-md bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20"
            >
              <Trash size={14} />
              <span>Delete</span>
            </button>
            <button 
              className="flex items-center gap-1 rounded-md bg-muted px-3 py-1.5 text-sm hover:bg-muted/80"
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Prompts</h2>
        <Link 
          href={`/projects/${project.id}/prompts/new`} 
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} />
          <span>New Prompt</span>
        </Link>
      </div>

      {prompts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h3 className="mb-2 text-xl font-medium">No prompts yet</h3>
          <p className="mb-6 text-muted-foreground">
            Create your first prompt to start generating Manim animations
          </p>
          <Link 
            href={`/projects/${project.id}/prompts/new`} 
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            <span>Create a Prompt</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div 
              key={prompt.id} 
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded bg-muted px-2 py-1 text-xs">
                  {prompt.type === 'USER' ? 'User Prompt' : 'System Prompt'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="mb-4 whitespace-pre-wrap">{prompt.value}</p>
              
              <div className="flex items-center justify-between">
                {prompt.videoUrl ? (
                  <Link 
                    href={`/projects/${project.id}/prompts/${prompt.id}`} 
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <PlayCircle size={16} />
                    <span>View Animation</span>
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">No animation generated yet</span>
                )}
                
                <div className="flex gap-2">
                  <button className="text-sm text-muted-foreground hover:text-foreground">
                    Edit
                  </button>
                  <button className="text-sm text-destructive hover:text-destructive/80">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 