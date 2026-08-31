'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(6, 'Min 6 characters') });
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try { setError(''); await signInWithEmail(data.email, data.password); router.push('/dashboard'); }
    catch { setError('Invalid email or password.'); }
  };
  const handleGoogle = async () => {
    try { setGoogleLoading(true); setError(''); await signInWithGoogle(); router.push('/dashboard'); }
    catch { setError('Google sign-in failed.'); setGoogleLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">💪 <span className="text-orange-400">GymFrek</span></h1>
        <p className="text-gray-400 mt-2">Sign in to your account</p>
      </div>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 space-y-6">
        {error && <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
        <button onClick={handleGoogle} disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
        <div className="flex items-center gap-4"><div className="flex-1 h-px bg-gray-700"/><span className="text-gray-500 text-sm">or</span><div className="flex-1 h-px bg-gray-700"/></div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"/>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input {...register('password')} type="password" placeholder="••••••••"
              className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"/>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          No account? <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
