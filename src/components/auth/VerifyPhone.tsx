import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AuthLayout from './AuthLayout';

const VerifyPhone: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      // Verify the phone number with the code
      const { error: verificationError } = await supabase.functions.invoke('verify-phone', {
        body: { code, phone: user.phone }
      });

      if (verificationError) throw verificationError;

      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone_verified: true })
        .eq('id', user.id);

      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { phone: user.phone }
      });

      if (error) throw error;

      alert('Verification code has been resent');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout
      title="Verify your phone"
      subtitle="Enter the verification code sent to your phone"
      linkText="Back to sign in"
      linkHref="/login"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter 6-digit code"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Phone Number'}
        </button>

        <button
          type="button"
          onClick={resendCode}
          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Resend verification code
        </button>
      </form>
    </AuthLayout>
  );
};

export default VerifyPhone;