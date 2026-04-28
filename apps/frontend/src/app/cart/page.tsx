'use client';
import { useEffect } from 'react';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { formatPrice } from '../../lib/utils';
import Link from 'next/link';

export default function CartPage() {
  const { items, total, fetchCart, removeItem, updateItem, isLoading } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Մուտք գործեք զամբյուղ դիտելու համար</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Մուտք</Link>
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Զամբյուղ</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-500 mb-4">Զամբյուղն դատարկ է</p>
            <Link href="/catalog" className="text-blue-600 hover:underline">Դիտել կատալոգը</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl p-4 border flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full border text-gray-500 hover:bg-gray-50">-</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full border text-gray-500 hover:bg-gray-50">+</button>
                  </div>
                  <span className="font-semibold text-blue-600 w-24 text-right">{formatPrice(item.price * item.quantity)}</span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-6 border h-fit">
              <h3 className="font-semibold mb-4 text-gray-700">Ամփոփ</h3>
              <div className="flex justify-between mb-4">
                <span className="text-gray-500">Ընդամենը</span>
                <span className="font-bold text-blue-600">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout" className="block w-full bg-blue-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition">
                Վճարել
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
