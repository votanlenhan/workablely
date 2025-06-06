'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  DollarSign, 
  Clock, 
  Banknote,
  FileText,
  UserPlus,
  BarChart3,
  Users
} from 'lucide-react';

const statsCards = [
  {
    title: 'Shows tháng này',
    value: '24',
    change: '+12%',
    icon: Camera,
    color: 'text-blue-600',
  },
  {
    title: 'Doanh thu tháng',
    value: '₫ 450M',
    change: '+8.2%',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Chưa thu',
    value: '₫ 125M',
    change: '-5%',
    icon: Clock,
    color: 'text-orange-600',
  },
  {
    title: 'Tiền mặt',
    value: '₫ 75M',
    change: '+15%',
    icon: Banknote,
    color: 'text-purple-600',
  },
];

const recentShows = [
  {
    id: 'SH001',
    client: 'Nguyễn Văn A',
    type: 'Wedding',
    date: '15/01',
    value: '₫ 25M',
    status: 'Hoàn thành',
  },
  {
    id: 'SH002',
    client: 'Trần Thị B',
    type: 'Portrait',
    date: '16/01',
    value: '₫ 8M',
    status: 'Đang xử lý',
  },
  {
    id: 'SH003',
    client: 'Lê Văn C',
    type: 'Event',
    date: '17/01',
    value: '₫ 15M',
    status: 'Chưa thu',
  },
];

const pendingPayments = [
  {
    client: 'Nguyễn Văn D',
    amount: '₫ 20M',
    dueDate: '20/01',
    overdue: false,
  },
  {
    client: 'Trần Thị E',
    amount: '₫ 12M',
    dueDate: '18/01',
    overdue: true,
  },
  {
    client: 'Lê Văn F',
    amount: '₫ 8M',
    dueDate: '25/01',
    overdue: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <FileText className="h-3 w-3" />
            Xuất báo cáo
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1">
            <Camera className="h-3 w-3" />
            Tạo Show
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-sm transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.color}`}>
                  {stat.change} vs tháng trước
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Shows */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4" />
              Shows gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentShows.map((show) => (
                <div key={show.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{show.client}</p>
                    <p className="text-xs text-muted-foreground">
                      {show.type} • {show.date}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{show.value}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      show.status === 'Hoàn thành' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : show.status === 'Đang xử lý'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    }`}>
                      {show.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
              Xem tất cả
            </Button>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Thanh toán chờ thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{payment.client}</p>
                    <p className="text-xs text-muted-foreground">
                      Hạn: {payment.dueDate}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{payment.amount}</p>
                    {payment.overdue && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        Quá hạn
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
              Quản lý thanh toán
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" className="h-16 flex flex-col gap-1 text-xs">
              <Camera className="h-4 w-4" />
              <span>Tạo Show</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1 text-xs">
              <DollarSign className="h-4 w-4" />
              <span>Ghi nhận thu</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1 text-xs">
              <BarChart3 className="h-4 w-4" />
              <span>Báo cáo</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col gap-1 text-xs">
              <Users className="h-4 w-4" />
              <span>Nhân viên</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 