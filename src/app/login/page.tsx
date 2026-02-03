'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout, InputField, Button } from '@/components';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login:', { email, password });
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Login</h1>
        <p className="text-gray-600 text-lg">Enter your credentials to access your account</p>
      </div>

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
          <Button type="submit">Login</Button>
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
