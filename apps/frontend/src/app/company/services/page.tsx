'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { createServiceSchema, CreateServiceInput, PriceType } from '@tina/shared';
import { formatPrice } from '../../../lib/utils';

export default function CompanyServicesPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ['company-services'],
    queryFn: async () => {
      try {
        const company = await api.get('/companies/me');
        const { data } = await api.get(`/services?companyId=${company.data.data.id}&pageSize=100`);
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/company/setup');
        }
        throw err;
      }
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.data; },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { priceType: PriceType.FIXED },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceInput) => api.post('/services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-services'] });
      setShowForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-services'] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Ծառայություններ</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            + Ավելացնել
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-6 border mb-6">
            <h2 className="font-semibold mb-4 text-gray-700">Նոր ծառայություն</h2>
            <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input {...register('title')} placeholder="Վերնագիր *" className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="md:col-span-2">
                <textarea {...register('description')} placeholder="Նկարագրություն *" rows={3} className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <select {...register('categoryId')} className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Կատեգորիա *</option>
                  {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <select {...register('priceType')} className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {Object.values(PriceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <input {...register('price', { valueAsNumber: true })} type="number" placeholder="Գին *" className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <input {...register('duration')} placeholder="Տևողություն (օր.՝ 3 ժամ)" className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
                  Պահպանել
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2">
                  Չեղարկել
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {data?.data?.map((service: any) => (
            <div key={service.id} className="bg-white rounded-xl p-4 border flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{service.title}</p>
                <p className="text-sm text-gray-400">{service.category?.name} · {formatPrice(Number(service.price))} / {service.priceType}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${service.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {service.isActive ? 'Ակտիվ' : 'Ոչ ակտիվ'}
                </span>
                <button onClick={() => deleteMutation.mutate(service.id)} className="text-red-400 hover:text-red-600 text-sm">Ջնջել</button>
              </div>
            </div>
          ))}
          {(!data?.data || data.data.length === 0) && (
            <div className="bg-white rounded-xl p-12 text-center border">
              <p className="text-gray-400">Ծառայություններ չկան</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
