'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';

  // Show loading spinner only on initial load, not on every auth state change
  if (loading && !isAuthenticated) {
    return <LoadingSpinner />;
  }

  // Show children without layout for login page or unauthenticated users
  if (isLoginPage || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex pt-[64px]">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:ml-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
