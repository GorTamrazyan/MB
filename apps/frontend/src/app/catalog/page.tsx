'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Service } from '@tina/shared';
import { formatPrice } from '../../lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['services', debouncedSearch, minPrice, maxPrice, sortBy, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), sortBy });
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const { data } = await api.get(`/services?${params}`);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Ծառայությունների կատալոգ</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Որոնել ծառայություն..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-48 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Նվազ. գին"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); setPage(1); }}
            className="w-32 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Ամաք. գին"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
            className="w-32 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Ռելևանտություն</option>
            <option value="price_asc">Գին ↑</option>
            <option value="price_desc">Գին ↓</option>
            <option value="newest">Նոր</option>
          </select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">Գտնվել է {data?.total ?? 0} ծառայություն</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data?.map((service: Service) => (
                <Link key={service.id} href={`/catalog/${service.slug}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-0 overflow-hidden group">
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                      {service.images?.[0] ? (
                        <Image
                          src={service.images[0].imageUrl}
                          alt={service.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📦</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-blue-600 font-medium">{(service as any).category?.name}</span>
                        {(service as any).company?.isVerified && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓ Ստուգված</span>}
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{service.title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{(service as any).company?.companyName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600">{formatPrice(Number(service.price))}</span>
                        <span className="text-xs text-gray-400">{service.priceType}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data?.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                      p === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
