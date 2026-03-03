import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Ghost Protocol — Admin Control System',
  description: 'Internal admin dashboard for the Ghost Protocol Hackathon Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-inter antialiased bg-[#050508] text-white`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>

      </body>
    </html>
  );
}
