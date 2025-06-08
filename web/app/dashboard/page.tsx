'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useYear } from '@/lib/year-context';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertCircle,
  Plus,
  Calculator,
  FileText,
  UserPlus,
  BarChart3,
  Users,
  UserCheck,
  TrendingUp,
  PieChart,
  Wallet,
  Target,
  ArrowUpCircle,
  Info,
  AlertTriangle,
  LineChart
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function DashboardPage() {
  const { currentYear } = useYear();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data
  const stats = [
    {
      title: 'Shows tháng này',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(450000000),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Chưa thu',
      value: formatCurrency(85000000),
      change: '-5.1%',
      changeType: 'negative' as const,
      icon: AlertCircle,
    },
    {
      title: 'Tiền mặt hiện tại',
      value: formatCurrency(125000000),
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Calculator,
    },
  ];

  // Financial overview data for dashboard
  const financialOverview = {
    budgetStatus: {
      totalBudget: 200000000,
      fixedExpenses: 85000000,
      wishlistFund: 80000000,
      externalIncome: 25000000,
      availableFunds: 60000000, // Budget - Used + External Income
      usedWishlist: 45000000,
    },
    cashFlow: {
      startingCash: 100000000,
      totalIncome: 475000000, // Revenue + External Income
      totalExpenses: 380000000, // Salaries + Fixed + Wishlist
      currentBalance: 195000000,
    },
    alerts: [
      {
        type: 'warning',
        message: 'Quỹ Wishlist đã sử dụng 56% (45M/80M)',
        severity: 'medium'
      },
      {
        type: 'info', 
        message: 'Thu ngoài tháng này: 25M VND',
        severity: 'low'
      }
    ]
  };

  const recentShows = [
    {
      id: 'SH001',
      client: 'Nguyễn Văn A',
      type: 'Cưới',
      date: `${currentYear}-01-15`,
      value: 25000000,
      status: 'Hoàn thành',
    },
    {
      id: 'SH002',
      client: 'Trần Thị B',
      type: 'Chân dung',
      date: `${currentYear}-01-14`,
      value: 8000000,
      status: 'Đang xử lý',
    },
    {
      id: 'SH003',
      client: 'Lê Văn C',
      type: 'Sự kiện',
      date: `${currentYear}-01-13`,
      value: 15000000,
      status: 'Chưa thu',
    },
  ];

  const pendingPayments = [
    {
      id: 'PAY001',
      client: 'Phạm Thị D',
      amount: 12000000,
      dueDate: `${currentYear}-01-10`,
      overdue: true,
    },
    {
      id: 'PAY002',
      client: 'Hoàng Văn E',
      amount: 18000000,
      dueDate: `${currentYear}-01-20`,
      overdue: false,
    },
  ];

  const recentTransactions = [
    {
      id: 'TXN001',
      description: 'Thanh toán show cưới - Nguyễn Văn A',
      amount: 25000000,
      date: `15/01/${currentYear}`,
      type: 'income' as const,
    },
    {
      id: 'TXN002',
      description: 'Mua thiết bị máy ảnh mới',
      amount: 15000000,
      date: `14/01/${currentYear}`,
      type: 'expense' as const,
    },
    {
      id: 'TXN003',
      description: 'Chi lương tháng 1',
      amount: 45000000,
      date: `13/01/${currentYear}`,
      type: 'expense' as const,
    },
  ];

  // Chart data from 2020 to present
  const chartData = [
    // 2020
    { month: 'T1/2020', doanhthu: 180, chiWishlist: 25, thuNgoai: 12 },
    { month: 'T2/2020', doanhthu: 200, chiWishlist: 28, thuNgoai: 15 },
    { month: 'T3/2020', doanhthu: 120, chiWishlist: 18, thuNgoai: 8 }, // COVID impact
    { month: 'T4/2020', doanhthu: 90, chiWishlist: 15, thuNgoai: 5 },
    { month: 'T5/2020', doanhthu: 110, chiWishlist: 20, thuNgoai: 10 },
    { month: 'T6/2020', doanhthu: 150, chiWishlist: 22, thuNgoai: 12 },
    { month: 'T7/2020', doanhthu: 170, chiWishlist: 25, thuNgoai: 14 },
    { month: 'T8/2020', doanhthu: 190, chiWishlist: 28, thuNgoai: 16 },
    { month: 'T9/2020', doanhthu: 210, chiWishlist: 30, thuNgoai: 18 },
    { month: 'T10/2020', doanhthu: 240, chiWishlist: 35, thuNgoai: 20 },
    { month: 'T11/2020', doanhthu: 260, chiWishlist: 38, thuNgoai: 22 },
    { month: 'T12/2020', doanhthu: 280, chiWishlist: 40, thuNgoai: 25 },
    
    // 2021
    { month: 'T1/2021', doanhthu: 250, chiWishlist: 35, thuNgoai: 20 },
    { month: 'T2/2021', doanhthu: 270, chiWishlist: 38, thuNgoai: 22 },
    { month: 'T3/2021', doanhthu: 290, chiWishlist: 40, thuNgoai: 25 },
    { month: 'T4/2021', doanhthu: 320, chiWishlist: 45, thuNgoai: 28 },
    { month: 'T5/2021', doanhthu: 340, chiWishlist: 48, thuNgoai: 30 },
    { month: 'T6/2021', doanhthu: 360, chiWishlist: 50, thuNgoai: 32 },
    { month: 'T7/2021', doanhthu: 330, chiWishlist: 46, thuNgoai: 28 },
    { month: 'T8/2021', doanhthu: 350, chiWishlist: 48, thuNgoai: 30 },
    { month: 'T9/2021', doanhthu: 370, chiWishlist: 52, thuNgoai: 35 },
    { month: 'T10/2021', doanhthu: 400, chiWishlist: 55, thuNgoai: 38 },
    { month: 'T11/2021', doanhthu: 420, chiWishlist: 58, thuNgoai: 40 },
    { month: 'T12/2021', doanhthu: 450, chiWishlist: 62, thuNgoai: 42 },
    
    // 2022
    { month: 'T1/2022', doanhthu: 380, chiWishlist: 52, thuNgoai: 35 },
    { month: 'T2/2022', doanhthu: 400, chiWishlist: 55, thuNgoai: 38 },
    { month: 'T3/2022', doanhthu: 420, chiWishlist: 58, thuNgoai: 40 },
    { month: 'T4/2022', doanhthu: 460, chiWishlist: 65, thuNgoai: 45 },
    { month: 'T5/2022', doanhthu: 480, chiWishlist: 68, thuNgoai: 48 },
    { month: 'T6/2022', doanhthu: 500, chiWishlist: 70, thuNgoai: 50 },
    { month: 'T7/2022', doanhthu: 470, chiWishlist: 66, thuNgoai: 46 },
    { month: 'T8/2022', doanhthu: 490, chiWishlist: 68, thuNgoai: 48 },
    { month: 'T9/2022', doanhthu: 520, chiWishlist: 72, thuNgoai: 52 },
    { month: 'T10/2022', doanhthu: 550, chiWishlist: 76, thuNgoai: 55 },
    { month: 'T11/2022', doanhthu: 580, chiWishlist: 80, thuNgoai: 58 },
    { month: 'T12/2022', doanhthu: 600, chiWishlist: 85, thuNgoai: 60 },
    
    // 2023
    { month: 'T1/2023', doanhthu: 520, chiWishlist: 72, thuNgoai: 50 },
    { month: 'T2/2023', doanhthu: 540, chiWishlist: 75, thuNgoai: 52 },
    { month: 'T3/2023', doanhthu: 480, chiWishlist: 68, thuNgoai: 45 },
    { month: 'T4/2023', doanhthu: 560, chiWishlist: 78, thuNgoai: 55 },
    { month: 'T5/2023', doanhthu: 590, chiWishlist: 82, thuNgoai: 58 },
    { month: 'T6/2023', doanhthu: 620, chiWishlist: 86, thuNgoai: 62 },
    { month: 'T7/2023', doanhthu: 580, chiWishlist: 80, thuNgoai: 56 },
    { month: 'T8/2023', doanhthu: 600, chiWishlist: 84, thuNgoai: 60 },
    { month: 'T9/2023', doanhthu: 640, chiWishlist: 88, thuNgoai: 65 },
    { month: 'T10/2023', doanhthu: 680, chiWishlist: 95, thuNgoai: 70 },
    { month: 'T11/2023', doanhthu: 720, chiWishlist: 100, thuNgoai: 75 },
    { month: 'T12/2023', doanhthu: 750, chiWishlist: 105, thuNgoai: 78 },
    
    // 2024
    { month: 'T1/2024', doanhthu: 680, chiWishlist: 95, thuNgoai: 65 },
    { month: 'T2/2024', doanhthu: 700, chiWishlist: 98, thuNgoai: 68 },
    { month: 'T3/2024', doanhthu: 650, chiWishlist: 90, thuNgoai: 60 },
    { month: 'T4/2024', doanhthu: 720, chiWishlist: 100, thuNgoai: 70 },
    { month: 'T5/2024', doanhthu: 760, chiWishlist: 105, thuNgoai: 75 },
    { month: 'T6/2024', doanhthu: 800, chiWishlist: 110, thuNgoai: 80 },
    { month: 'T7/2024', doanhthu: 740, chiWishlist: 102, thuNgoai: 72 },
    { month: 'T8/2024', doanhthu: 780, chiWishlist: 108, thuNgoai: 78 },
    { month: 'T9/2024', doanhthu: 820, chiWishlist: 115, thuNgoai: 85 },
    { month: 'T10/2024', doanhthu: 860, chiWishlist: 120, thuNgoai: 90 },
    { month: 'T11/2024', doanhthu: 900, chiWishlist: 125, thuNgoai: 95 },
    { month: 'T12/2024', doanhthu: 850, chiWishlist: 118, thuNgoai: 88 },
    
    // 2025
    { month: 'T1/2025', doanhthu: 780, chiWishlist: 108, thuNgoai: 80 },
  ];

  const formatTooltipValue = (value: number, name: string) => {
    const labels: { [key: string]: string } = {
      doanhthu: 'Doanh thu',
      chiWishlist: 'Chi Wishlist',
      thuNgoai: 'Thu ngoài'
    };
    return [`${formatCurrency(value * 1000000)}`, labels[name] || name];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Đang xử lý':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Chưa thu':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-base font-bold">{stat.value}</p>
                  <p className={`text-xs ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} so với tháng trước
                  </p>
                </div>
                <stat.icon className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Overview Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <PieChart className="h-4 w-4" />
                      Tình hình Quyết Toán
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng dự toán</p>
                  <p className="text-base font-bold">{formatCurrency(financialOverview.budgetStatus.totalBudget)}</p>
                  <p className="text-xs text-blue-600">Ngân sách tháng này</p>
                </div>
                <Target className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Chi phí cố định</p>
                  <p className="text-base font-bold">{formatCurrency(financialOverview.budgetStatus.fixedExpenses)}</p>
                  <p className="text-xs text-orange-600">Tiền nhà, điện, nước...</p>
                </div>
                <Calculator className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Quỹ Wishlist</p>
                  <p className="text-base font-bold">{formatCurrency(financialOverview.budgetStatus.availableFunds)}</p>
                  <p className="text-xs text-green-600">Khả dụng: {Math.round((financialOverview.budgetStatus.availableFunds / financialOverview.budgetStatus.wishlistFund) * 100)}%</p>
                </div>
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Thu ngoài</p>
                  <p className="text-base font-bold">{formatCurrency(financialOverview.budgetStatus.externalIncome)}</p>
                  <p className="text-xs text-green-600">Bổ sung quỹ Wishlist</p>
                </div>
                <ArrowUpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Alerts */}
        {financialOverview.alerts.length > 0 && (
          <div className="space-y-1">
            {financialOverview.alerts.map((alert, index) => (
              <div key={index} className={`flex items-center gap-2 p-2 rounded-md text-xs ${
                alert.severity === 'medium' ? 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              }`}>
                {alert.severity === 'medium' ? 
                  <AlertTriangle className="h-3 w-3" /> : 
                  <Info className="h-3 w-3" />
                }
                {alert.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Trends Chart */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <LineChart className="h-4 w-4" />
          Xu hướng Tài chính (2020 - 2025)
        </h3>
        
        <Card>
          <CardContent className="p-3">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}M`}
                  />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="doanhthu" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="Doanh thu"
                    dot={false}
                    activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: '#2563eb' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="chiWishlist" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Chi Wishlist"
                    dot={false}
                    activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2, fill: '#dc2626' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="thuNgoai" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Thu ngoài"
                    dot={false}
                    activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#16a34a' }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Legend with Current Values */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-xs font-medium">Doanh thu</span>
                </div>
                <p className="text-sm font-bold text-blue-600">
                  {formatCurrency((chartData[chartData.length - 1]?.doanhthu || 0) * 1000000)}
                </p>
                <p className="text-xs text-muted-foreground">Tháng hiện tại</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-xs font-medium">Chi Wishlist</span>
                </div>
                <p className="text-sm font-bold text-red-600">
                  {formatCurrency((chartData[chartData.length - 1]?.chiWishlist || 0) * 1000000)}
                </p>
                <p className="text-xs text-muted-foreground">Tháng hiện tại</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-xs font-medium">Thu ngoài</span>
                </div>
                <p className="text-sm font-bold text-green-600">
                  {formatCurrency((chartData[chartData.length - 1]?.thuNgoai || 0) * 1000000)}
                </p>
                <p className="text-xs text-muted-foreground">Tháng hiện tại</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Recent Shows */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Shows gần đây</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {recentShows.map((show) => (
                <div key={show.id} className="flex items-center justify-between p-1.5 border border-border rounded text-xs">
                  <div>
                    <p className="font-medium">{show.client}</p>
                    <p className="text-muted-foreground">{show.type} • {show.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(show.value)}</p>
                    <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-xs ${getStatusColor(show.status)}`}>
                      {show.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Thanh toán chờ thu</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-1.5 border border-border rounded text-xs">
                  <div>
                    <p className="font-medium">{payment.client}</p>
                    <p className={`text-xs ${payment.overdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                      Hạn: {payment.dueDate} {payment.overdue && '(Quá hạn)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    {payment.overdue && (
                      <AlertCircle className="h-3 w-3 text-red-600 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-1.5 border border-border rounded text-xs">
                  <div className="flex items-center gap-2">
                    {transaction.type === 'income' ? (
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-red-600 rounded-full" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 