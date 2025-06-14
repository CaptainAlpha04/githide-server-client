"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { RepositoryCard } from '@/components/repository/RepositoryCard';
import { CreateRepositoryForm } from '@/components/repository/CreateRepositoryForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Repository {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (isLoading || !auth.currentUser) return;

    const userEmail = auth.currentUser.email;
    if (!userEmail) return;

    // Query repositories where user is either owner or collaborator
    const q = query(
      collection(db, 'repositories'),
      or(
        where('ownerId', '==', auth.currentUser.uid),
        where('collaborators', 'array-contains', userEmail)
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repos: Repository[] = [];
      snapshot.forEach((doc) => {
        repos.push({ id: doc.id, ...doc.data() } as Repository);
      });
      setRepositories(repos);
    });

    return () => unsubscribe();
  }, [isLoading]);

  const handleCreateSuccess = () => {
    setIsCreating(false);
  };

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
        <div className="flex gap-4">
          <Button onClick={() => router.push('/profile')}>
            Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? 'Cancel' : 'New Repository'}
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Create New Repository</h2>
          <CreateRepositoryForm
            userId={auth.currentUser?.uid || ''}
            onSuccess={handleCreateSuccess}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repo) => (
          <RepositoryCard
            key={repo.id}
            id={repo.id}
            name={repo.name}
            description={repo.description}
            ownerId={repo.ownerId}
            currentUserId={auth.currentUser?.uid || ''}
            collaborators={repo.collaborators}
            onDelete={() => {
              setRepositories((prev) =>
                prev.filter((r) => r.id !== repo.id)
              );
            }}
          />
        ))}
      </div>

      {repositories.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <p className="text-gray-500">No repositories yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
} 