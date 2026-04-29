'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

interface CompanySetupInput {
  companyName: string;
  legalName: string;
  taxId?: string;
  description?: string;
  website?: string;
}

export default function CompanySetupPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanySetupInput>();

  const onSubmit = async (values: CompanySetupInput) => {
    setError('');
    try {
      await api.post('/companies', values);
      router.push('/company/services');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания профиля');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Профиль компании</h1>
        <p className="text-gray-500 text-sm mb-6">Заполните данные компании, чтобы начать добавлять услуги</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название компании *</label>
            <input
              {...register('companyName', { required: 'Обязательное поле' })}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ООО Пример"
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Юридическое название *</label>
            <input
              {...register('legalName', { required: 'Обязательное поле' })}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ООО «Пример»"
            />
            {errors.legalName && <p className="text-red-500 text-xs mt-1">{errors.legalName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ИНН / Tax ID</label>
            <input
              {...register('taxId')}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Коротко о вашей компании..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сайт</label>
            <input
              {...register('website')}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Сохранение...' : 'Создать профиль компании'}
          </button>
        </form>
      </div>
    </div>
  );
}
