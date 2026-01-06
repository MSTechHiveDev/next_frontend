'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, otpSchema, type RegisterForm, type OtpForm } from '@/lib/schemas';
import { authService } from '@/lib/integrations';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const { register: registerUser } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: form, 1: otp
  const [formData, setFormData] = useState<RegisterForm | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onFormSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      await authService.sendOtpClient({ mobile: data.mobile, email: data.email });
      setFormData(data);
      setStep(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data: OtpForm) => {
    if (!formData) return;
    setLoading(true);
    setError('');
    try {
      await authService.verifyOtpClient({ mobile: formData.mobile, otp: data.otp });
      // Now register
      const registerData = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        otp: data.otp,
        consentGiven: true,
      };
      await authService.registerClient(registerData);
      // For now, redirect to login
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1 && formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h2 className="text-center text-3xl font-bold">Verify OTP</h2>
          <p className="text-center">OTP sent to {formData.email}</p>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP
              </label>
              <input
                {...otpForm.register('otp')}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {otpForm.formState.errors.otp && <p className="text-red-500 text-sm">{otpForm.formState.errors.otp.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
          </form>
          <button onClick={() => setStep(0)} className="w-full text-blue-600">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold">Register</h2>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              {...form.register('name')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobile
            </label>
            <input
              {...form.register('mobile')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {form.formState.errors.mobile && <p className="text-red-500 text-sm">{form.formState.errors.mobile.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              {...form.register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {form.formState.errors.email && <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...form.register('password')}
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {form.formState.errors.password && <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              {...form.register('confirmPassword')}
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {form.formState.errors.confirmPassword && <p className="text-red-500 text-sm">{form.formState.errors.confirmPassword.message}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        <p className="text-center">
          Already have an account? <a href="/auth/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
}