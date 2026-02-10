'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout, InputField, Button } from '@/components';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, loading, error, clearError } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role === 'teacher') {
        router.replace('/teacher');
      } else {
        router.replace('/student-dashboard');
      }
    }
  }, [user, loading, router]);

  // Clear error when inputs change
  useEffect(() => {
    if (error) clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Redirect is handled by the useEffect above
    } catch {
      // Error is set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show nothing while checking auth state
  if (loading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AuthLayout>
    );
  }

  // Don't render form if already logged in (waiting for redirect)
  if (user) return null;

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Login</h1>
        <p className="text-gray-600 text-lg">Enter your credentials to access your account</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          showPasswordToggle
          rightElement={
            <Link
              href="/forgot-password"
              className="text-sm text-gray-500 hover:text-green-600 link-hover"
            >
              Forget Password
            </Link>
          }
        />

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-gray-700 hover:text-green-600 font-medium link-hover">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
