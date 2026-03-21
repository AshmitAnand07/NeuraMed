import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ReminderEngine from '@/components/ReminderEngine';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'NeuraMed AI - Smart Medicine Management',
  description: 'Track, Donate, and Redistribute Medicines to reduce wastage.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 text-lg md:text-base`}>
        <AuthProvider>
          <Navbar />
          <ReminderEngine />
          <main className="min-h-[calc(100vh-64px)] pb-20 md:pb-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
