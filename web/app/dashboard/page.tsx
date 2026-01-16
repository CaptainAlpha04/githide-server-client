"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useRepositories } from '@/hooks/use-api';
import { RepositoryCard } from '@/components/repository/RepositoryCard';
import { CreateRepositoryForm } from '@/components/repository/CreateRepositoryForm';
import { Button } from '@/components/ui/button';

interface Repository {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: repositories = [], isLoading, error } = useRepositories();

  const handleDelete = (repoId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete repository:', repoId);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Repositories</h1>
        <Button onClick={() => router.push('/profile')}>
          Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <p>Loading repositories...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-500">Failed to load repositories</p>
          </div>
        ) : repositories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No repositories yet. Create your first one!</p>
          </div>
        ) : (
          repositories.map((repo: any) => (
            <RepositoryCard
              key={repo.id}
              id={repo.id}
              name={repo.name}
              description={repo.description}
              ownerId={repo.ownerId}
              currentUserId={auth.currentUser?.uid || ''}
              collaborators={repo.collaborators}
            />
          ))
        )}
      </div>

      <div className="mt-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Create New Repository</h2>
        <CreateRepositoryForm />
      </div>
    </div>
  );
} 