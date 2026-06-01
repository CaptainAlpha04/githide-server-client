"use client"

import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile } from '@/lib/firebase';
import { ArrowLeft, Lock, Loader2, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setDisplayName(user.displayName || '');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      await updateUserProfile(auth.currentUser.uid, { displayName });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-zinc-200">|</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm">Profile Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100">
          <div className="p-6">
            <h2 className="font-semibold text-sm text-zinc-900 mb-5">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700" htmlFor="displayName">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700" htmlFor="email">
                  Email address
                </label>
                <Input
                  id="email"
                  value={auth.currentUser?.email || ''}
                  disabled
                />
                <p className="text-xs text-zinc-400">Email address cannot be changed.</p>
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </form>
          </div>

          <div className="p-6">
            <h2 className="font-semibold text-sm text-zinc-900 mb-1">Sign Out</h2>
            <p className="text-xs text-zinc-500 mb-4">
              You will be signed out of GitHide on this device.
            </p>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
