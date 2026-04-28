'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import Link from 'next/link';

export default function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const { data } = await api.get('/admin/stats'); return data.data; },
  });

  const { data: companies } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => { const { data } = await api.get('/admin/companies'); return data; },
  });

  const queryClient = useQueryClient();
  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      api.put(`/admin/companies/${id}/verify`, { isVerified }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-companies'] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Ադմինիստրատոր</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Օգտատերեր', value: stats.users },
              { label: 'Ընկերություններ', value: stats.companies },
              { label: 'Պատվերներ', value: stats.orders },
              { label: 'Եկամուտ', value: `${Number(stats.revenue).toLocaleString()} ֏` },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-6 border text-center">
                <div className="text-3xl font-bold text-blue-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Nav */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/users" className="bg-white border rounded-lg px-4 py-2 text-sm hover:bg-gray-50">Օգտատերեր</Link>
          <Link href="/admin/reviews" className="bg-white border rounded-lg px-4 py-2 text-sm hover:bg-gray-50">Կարծիքներ</Link>
        </div>

        {/* Companies */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Ընկերություններ</h2>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ընկերություն</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ստուգված</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Ամսաթիվ</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies?.data?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{c.companyName}</p>
                    <p className="text-gray-400 text-xs">{c.legalName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.isVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {c.isVerified ? 'Ստուգված' : 'Ընթացքում'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => verifyMutation.mutate({ id: c.id, isVerified: !c.isVerified })}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {c.isVerified ? 'Չեղարկել' : 'Հաստատել'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
