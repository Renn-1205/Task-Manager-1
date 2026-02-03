'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout, InputField, Button } from '@/components';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log('Forgot password:', { emailOrPhone });
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forget Password</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <InputField
          label="Email/Phone number"
          type="text"
          value={emailOrPhone}
          onChange={setEmailOrPhone}
          placeholder="Enter your email or phone number"
        />

        <div className="mt-6">
          <Button type="submit">Send</Button>
        </div>
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium link-hover">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
