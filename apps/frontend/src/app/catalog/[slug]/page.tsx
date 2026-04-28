'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { useCartStore } from '../../../stores/cart.store';
import { useAuthStore } from '../../../stores/auth.store';
import { formatPrice } from '../../../lib/utils';
import { ItemType } from '@tina/shared';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { data: res, isLoading } = useQuery({
    queryKey: ['service', params.slug],
    queryFn: async () => {
      const { data } = await api.get(`/services/${params.slug}`);
      return data.data;
    },
  });

  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return; }
    await addItem({
      id: res.id,
      type: ItemType.SERVICE,
      companyId: res.companyId,
      title: res.title,
      price: Number(res.price),
    });
    router.push('/cart');
  };

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-xl mb-6" />
      <div className="h-8 bg-gray-200 rounded mb-4 w-2/3" />
      <div className="h-4 bg-gray-200 rounded mb-2" />
    </div>
  );

  if (!res) return <div className="p-12 text-center text-gray-500">Ծառայությունը չի գտնվել</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Image */}
        {res.images?.[0] && (
          <div className="relative h-72 rounded-xl overflow-hidden mb-6">
            <Image src={res.images[0].imageUrl} alt={res.title} fill className="object-cover" />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-blue-600">{res.category?.name}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{res.title}</h1>
            <p className="text-gray-600 leading-relaxed">{res.description}</p>

            {/* Company info */}
            <div className="mt-8 p-4 bg-white rounded-xl border">
              <h3 className="font-semibold mb-2 text-gray-700">Ընկերություն</h3>
              <div className="flex items-center gap-3">
                {res.company?.logoUrl && (
                  <Image src={res.company.logoUrl} alt={res.company.companyName} width={40} height={40} className="rounded-full" />
                )}
                <div>
                  <p className="font-medium">{res.company?.companyName}</p>
                  {res.company?.isVerified && <span className="text-xs text-green-600">✓ Ստուգված ընկերություն</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-xl p-6 border h-fit sticky top-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">{formatPrice(Number(res.price))}</div>
            <div className="text-sm text-gray-400 mb-4">{res.priceType} {res.duration && `· ${res.duration}`}</div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Ավելացնել զամբյուղ
            </button>
            <p className="text-xs text-gray-400 mt-3 text-center">Անվտանգ վճարում Stripe-ով</p>
          </div>
        </div>
      </div>
    </div>
  );
}
