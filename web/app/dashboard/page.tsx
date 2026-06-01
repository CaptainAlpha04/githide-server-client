"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useRepositories } from '@/hooks/use-api';
import { RepositoryCard } from '@/components/repository/RepositoryCard';
import { CreateRepositoryForm } from '@/components/repository/CreateRepositoryForm';
import { Button } from '@/components/ui/button';
import { Lock, Plus, User, FolderGit2, X } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-100 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-zinc-100 rounded w-2/3" />
          <div className="h-3 bg-zinc-100 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-zinc-100 rounded w-full" />
      <div className="h-3 bg-zinc-100 rounded w-4/5" />
      <div className="h-px bg-zinc-100 rounded" />
      <div className="flex gap-2">
        <div className="h-7 w-16 bg-zinc-100 rounded-md" />
        <div className="h-7 w-16 bg-zinc-100 rounded-md" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: repositories = [], isLoading, error } = useRepositories();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) router.push('/login');
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm tracking-tight">GitHide</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 hidden sm:block truncate max-w-[200px]">
              {auth.currentUser?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => router.push('/profile')}>
              <User className="w-3.5 h-3.5 mr-1.5" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Repositories</h1>
            {!isLoading && (
              <p className="text-sm text-zinc-500 mt-0.5">
                {repositories.length === 0
                  ? 'No repositories yet'
                  : `${repositories.length} ${repositories.length === 1 ? 'repository' : 'repositories'}`}
              </p>
            )}
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? (
              <>
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                New Repository
              </>
            )}
          </Button>
        </div>

        {showCreateForm && (
          <div className="mb-8 p-6 border border-zinc-200 rounded-xl bg-white">
            <h2 className="font-semibold text-sm text-zinc-900 mb-5">New Repository</h2>
            <CreateRepositoryForm onSuccess={() => setShowCreateForm(false)} />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div className="text-center py-20 border border-red-100 rounded-xl bg-red-50">
            <p className="text-sm font-medium text-red-600 mb-1">Failed to load repositories</p>
            <p className="text-xs text-red-400">Check your connection and try refreshing the page</p>
          </div>
        ) : repositories.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-xl">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FolderGit2 className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600 mb-1">No repositories yet</p>
            <p className="text-xs text-zinc-400 mb-4">Create your first repository to start managing secrets</p>
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create Repository
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repositories.map((repo) => (
              <RepositoryCard
                key={repo.id}
                id={repo.id}
                name={repo.name}
                description={repo.description}
                ownerId={repo.ownerId}
                currentUserId={auth.currentUser?.uid || ''}
                collaborators={repo.collaborators}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
