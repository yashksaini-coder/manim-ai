'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/projects');
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchProjects();
    }
  }, [isLoaded, isSignedIn]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Link 
          href="/projects/new" 
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} />
          <span>New Project</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <h3 className="mb-2 text-xl font-medium">No projects yet</h3>
          <p className="mb-6 text-muted-foreground">
            Create your first project to get started with Manim AI
          </p>
          <Link 
            href="/projects/new" 
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            <span>Create a Project</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="mb-2 text-xl font-medium">{project.name}</h3>
              {project.description && (
                <p className="mb-4 line-clamp-2 text-muted-foreground">{project.description}</p>
              )}
              <div className="mt-auto flex items-center justify-between pt-4 text-sm text-muted-foreground">
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 