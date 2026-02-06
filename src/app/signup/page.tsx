'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout, InputField, Button } from '@/components';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Signup:', { name, email, password });
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
      </div>

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
          <Button type="submit">Register</Button>
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
