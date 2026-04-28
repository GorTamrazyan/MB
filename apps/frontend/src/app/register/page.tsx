'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput, Role } from '@tina/shared';
import { api } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('role') as Role) || Role.CLIENT;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  });

  const onSubmit = async (values: RegisterInput) => {
    setError('');
    try {
      await api.post('/auth/register', values);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Գրանցումն անհաջող');
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2">Ստուգեք էլ. փոստը</h2>
        <p className="text-gray-500 text-sm">Հաստատման հղումն ուղարկվել է ձեր էլ. փոստին</p>
        <Link href="/login" className="mt-6 inline-block text-blue-600 hover:underline text-sm">Դեպի մուտք</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Գրանցում</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Էլ. փոստ</label>
            <input {...register('email')} type="email" className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Գաղտնաբառ</label>
            <input {...register('password')} type="password" className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Հաշվի տեսակ</label>
            <select {...register('role')} className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={Role.CLIENT}>Հաճախորդ</option>
              <option value={Role.COMPANY}>Ընկերություն</option>
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {isSubmitting ? 'Բեռնվում է...' : 'Գրանցվել'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Հաշիվ ունե՞ք։{' '}
          <Link href="/login" className="text-blue-600 hover:underline">Մուտք</Link>
        </p>
      </div>
    </div>
  );
}
