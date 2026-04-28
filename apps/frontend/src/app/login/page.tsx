'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@tina/shared';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    setError('');
    try {
      const { data } = await api.post('/auth/login', values);
      setAuth(data.data.user, data.data.accessToken);
      // Set cookie so middleware can read the role
      document.cookie = `user=${encodeURIComponent(JSON.stringify(data.data.user))}; path=/; max-age=604800`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Մուտքն անհաջող');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Մուտք</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Էլ. փոստ</label>
            <input
              {...register('email')}
              type="email"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Գաղտնաբառ</label>
            <input
              {...register('password')}
              type="password"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Բեռնվում է...' : 'Մուտք'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Հաշիվ չունե՞ք։{' '}
          <Link href="/register" className="text-blue-600 hover:underline">Գրանցվել</Link>
        </p>
      </div>
    </div>
  );
}
