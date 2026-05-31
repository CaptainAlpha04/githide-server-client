"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Lock, Check } from 'lucide-react';

const features = [
  'End-to-end encrypted secrets',
  'Git-native workflow — no config changes',
  'Team access control built in',
];

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push('/dashboard');
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col bg-zinc-950 text-white p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight">GitHide</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <h2 className="text-4xl font-bold leading-tight tracking-tight mb-4">
            Secure your secrets,<br />ship with confidence.
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-10">
            Keep environment variables encrypted and out of your git history — without changing your workflow.
          </p>
          <ul className="space-y-3.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-zinc-300 text-sm">
                <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-indigo-400" strokeWidth={2.5} />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-zinc-600 text-xs">© {new Date().getFullYear()} GitHide</p>
      </div>

      {/* Right auth panel */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-8">
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight">GitHide</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-1.5">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-zinc-500">
              {isSignUp
                ? 'Start managing your secrets securely'
                : 'Sign in to access your repositories'}
            </p>
          </div>

          {isSignUp ? <SignUpForm /> : <SignInForm />}

          <p className="text-center text-sm text-zinc-500 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 font-medium hover:underline underline-offset-4 transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
