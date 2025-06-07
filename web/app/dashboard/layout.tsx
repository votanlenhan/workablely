'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Camera, 
  DollarSign, 
  CreditCard, 
  Users, 
  UserCheck, 
  Settings, 
  Menu, 
  X,
  BarChart3,
  Shirt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const navigation = [
  { name: 'Tổng quan', href: '/dashboard', icon: BarChart3 },
  { name: 'Shows', href: '/dashboard/shows', icon: Camera },
  { name: 'Doanh thu', href: '/dashboard/revenue', icon: DollarSign },
  { name: 'Tài chính', href: '/dashboard/finance', icon: CreditCard },
  { name: 'Nhân viên', href: '/dashboard/staff', icon: UserCheck },
  { name: 'Khách hàng', href: '/dashboard/clients', icon: Users },
  { name: 'Thuê đồ', href: '/dashboard/rentals', icon: Shirt },
  { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 bg-card border-r border-border transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex items-center justify-between h-12 px-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <span className="text-base font-bold">Guu Studio</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex-1 px-2 py-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-56'
      } bg-card border-r border-border transition-all duration-300`}>
        <div className="flex items-center justify-between h-12 px-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            {!sidebarCollapsed && <span className="text-base font-bold">Guu Studio</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="flex-1 px-2 py-2">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className={`${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'} transition-all duration-300`}>
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-12 items-center justify-between px-3 py-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-6 w-6 p-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-semibold">App Quản lý</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-sm h-8">
              Admin
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 