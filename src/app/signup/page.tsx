'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout, InputField, Button } from '@/components';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { signup, user, loading, error, clearError } = useAuth();
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

  // Clear errors when inputs change
  useEffect(() => {
    if (error) clearError();
    if (localError) setLocalError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side validation
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await signup(name, email, password);
      // Redirect is handled by the useEffect above
    } catch {
      // Error is set in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
      </div>

      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <InputField
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Enter your name"
        />

        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
        />

        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
        />

        <InputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm your password"
        />

        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>
        </div>
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium link-hover">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
