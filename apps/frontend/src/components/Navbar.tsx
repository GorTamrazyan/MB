'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-blue-600 text-lg">Tina</Link>
          <Link href="/catalog" className={`text-sm ${pathname.startsWith('/catalog') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            Ծառայություններ
          </Link>
          {user?.role === 'COMPANY' && (
            <Link href="/company/services" className={`text-sm ${pathname.startsWith('/company') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
              Իմ ծառայությունները
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className={`text-sm ${pathname.startsWith('/admin') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
              Ադմին
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                {user.email}
              </Link>
              {user.role !== 'COMPANY' && (
                <Link href="/cart" className="text-sm text-gray-600 hover:text-gray-900">
                  Զամբյուղ
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
                Ելք
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Մուտք</Link>
              <Link href="/register" className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700">
                Գրանցվել
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
