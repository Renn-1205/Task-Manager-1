'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout, InputField, Button } from '@/components';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle reset password logic here
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Reset password:', { newPassword });
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <InputField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
        />

        <InputField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm new password"
        />

        <div className="mt-6">
          <Button type="submit">Reset Password</Button>
        </div>
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        <Link href="/login" className="text-green-600 hover:text-green-700 font-medium link-hover">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}