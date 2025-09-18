'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Menu,
  X,
} from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission, role } = useAuth();
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: 'view_dashboard',
    },
    {
      title: 'Candidates',
      href: '/candidates',
      icon: Users,
      permission: 'view_candidates',
    },
    {
      title: 'Feedback',
      href: '/feedback',
      icon: FileText,
      permission: 'view_all_feedback',
    },
    {
      title: 'Role Management',
      href: '/roles',
      icon: Settings,
      permission: 'manage_roles',
    },
  ];

  const filteredItems = navigationItems.filter(item => {
    if (!hasPermission(item.permission)) return false;
    return true;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-50 border-r min-h-screen transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="p-4 space-y-2 mt-16 md:mt-0">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
