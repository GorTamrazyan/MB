import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'Tina Marketplace - Ծառայությունների հարթակ',
  description: 'B2B/B2C marketplace for company services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
