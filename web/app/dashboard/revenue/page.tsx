'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Camera, 
  Clock,
  Download,
  Calendar,
  Eye,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';

const revenueStats = [
  {
    title: 'Doanh thu tháng',
    value: '₫ 450M',
    target: '₫ 500M',
    progress: 90,
    change: '+8.2%',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Shows hoàn thành',
    value: '24',
    target: '30',
    progress: 80,
    change: '+12%',
    icon: Camera,
    color: 'text-blue-600',
  },
  {
    title: 'Chờ thanh toán',
    value: '₫ 125M',
    target: '₫ 0',
    progress: 25,
    change: '-5%',
    icon: Clock,
    color: 'text-orange-600',
  },
  {
    title: 'Hiệu suất',
    value: '92%',
    target: '95%',
    progress: 92,
    change: '+3%',
    icon: Target,
    color: 'text-purple-600',
  },
];

const monthlyRevenue = [
  { month: 'T1', revenue: 350, target: 400 },
  { month: 'T2', revenue: 420, target: 450 },
  { month: 'T3', revenue: 380, target: 420 },
  { month: 'T4', revenue: 450, target: 500 },
];

const showTypes = [
  { type: 'Wedding', revenue: 280, percentage: 62, shows: 12 },
  { type: 'Portrait', revenue: 95, percentage: 21, shows: 18 },
  { type: 'Event', revenue: 75, percentage: 17, shows: 8 },
];

const pendingPayments = [
  {
    id: 'SH001',
    client: 'Nguyễn Văn A',
    amount: 45000000,
    dueDate: '2024-01-20',
    overdue: false,
    showType: 'Wedding',
  },
  {
    id: 'SH005',
    client: 'Trần Thị E',
    amount: 32000000,
    dueDate: '2024-01-18',
    overdue: true,
    showType: 'Portrait',
  },
  {
    id: 'SH008',
    client: 'Lê Văn H',
    amount: 28000000,
    dueDate: '2024-01-25',
    overdue: false,
    showType: 'Event',
  },
];

export default function RevenuePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatFullCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Dashboard Doanh thu
        </h2>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-8 px-2 text-xs border border-input bg-background rounded-md"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
          </select>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Download className="h-3 w-3" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {revenueStats.map((stat, index) => {
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
                <div className="space-y-1">
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Target: {stat.target}</span>
                    <span className={stat.color}>{stat.change}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Doanh thu theo tháng (triệu ₫)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyRevenue.map((data, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{data.month}</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">Target: {data.target}M</span>
                      <span className="font-medium">{data.revenue}M</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(data.revenue / data.target) * 100}%` }}
                      />
                    </div>
                    <div className="absolute top-0 w-full h-2 rounded-full border-2 border-dashed border-muted-foreground/30" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Show Types Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4" />
              Phân tích theo loại show
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {showTypes.map((type, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{type.type}</span>
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">{type.shows} shows</span>
                      <span className="font-medium">{formatCurrency(type.revenue * 1000000)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${type.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{type.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Thanh toán chờ thu ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-2 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{payment.id}</span>
                      <span className="text-sm font-medium">{payment.client}</span>
                      {payment.overdue && (
                        <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3" />
                          Quá hạn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{payment.showType}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Hạn: {payment.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{formatCurrency(payment.amount)}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
            <span className="text-muted-foreground">
              Tổng chờ thu: {pendingPayments.length} khoản
            </span>
            <span className="font-medium">
              {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 