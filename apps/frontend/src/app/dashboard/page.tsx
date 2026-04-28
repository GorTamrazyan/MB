'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { formatPrice, formatDate } from '../../lib/utils';
import { Order, OrderStatus } from '@tina/shared';
import Link from 'next/link';

const statusColors: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Ընթացքում',
  CONFIRMED: 'Հաստատված',
  IN_PROGRESS: 'Մշակվում',
  COMPLETED: 'Ավարտված',
  CANCELLED: 'Չեղարկված',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Անձնական խցիկ</h1>
        <p className="text-gray-500 mb-8">{user?.email}</p>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Պատվերներ</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white h-20 rounded-xl animate-pulse" />)}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <p className="text-gray-400">Պատվերներ չկան</p>
            <Link href="/catalog" className="mt-4 inline-block text-blue-600 hover:underline">Ծառայություններ գտնել</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data?.map((order: Order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 border hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                    <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <p className="font-bold text-blue-600 mt-1">{formatPrice(Number(order.totalAmount))}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{order.items?.length} ծառայություն</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
