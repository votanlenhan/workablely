'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Camera,
  CreditCard,
  DollarSign,
  Users,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Shirt
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    title: 'Shows',
    href: '/dashboard/shows',
    icon: Camera,
  },
  {
    title: 'Doanh thu',
    href: '/dashboard/revenue',
    icon: DollarSign,
  },
  {
    title: 'Tài chính',
    href: '/dashboard/finance',
    icon: CreditCard,
  },
  {
    title: 'Nhân viên',
    href: '/dashboard/staff',
    icon: Users,
  },
  {
    title: 'Khách hàng',
    href: '/dashboard/clients',
    icon: UserCheck,
  },
  {
    title: 'Thuê đồ',
    href: '/dashboard/rentals',
    icon: Shirt,
  },
  {
    title: 'Cài đặt',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'bg-card border-r border-border transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-56' : 'w-14'
        )}
      >
        {/* Logo */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
              W
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-foreground text-sm">Guu Studio</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2 h-8 text-xs',
                    !sidebarOpen && 'px-2 justify-center'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.title}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full h-8 text-xs"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">
              App Quản lý
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 