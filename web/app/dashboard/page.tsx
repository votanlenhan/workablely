'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertTriangle
} from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function DashboardPage() {
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
      date: '2024-01-15',
      value: 25000000,
      status: 'Hoàn thành',
    },
    {
      id: 'SH002',
      client: 'Trần Thị B',
      type: 'Chân dung',
      date: '2024-01-14',
      value: 8000000,
      status: 'Đang xử lý',
    },
    {
      id: 'SH003',
      client: 'Lê Văn C',
      type: 'Sự kiện',
      date: '2024-01-13',
      value: 15000000,
      status: 'Chưa thu',
    },
  ];

  const pendingPayments = [
    {
      id: 'PAY001',
      client: 'Phạm Thị D',
      amount: 12000000,
      dueDate: '2024-01-10',
      overdue: true,
    },
    {
      id: 'PAY002',
      client: 'Hoàng Văn E',
      amount: 18000000,
      dueDate: '2024-01-20',
      overdue: false,
    },
  ];

  const recentTransactions = [
    {
      id: 'TXN001',
      description: 'Thanh toán show cưới - Nguyễn Văn A',
      amount: 25000000,
      date: '15/01/2024',
      type: 'income' as const,
    },
    {
      id: 'TXN002',
      description: 'Mua thiết bị máy ảnh mới',
      amount: 15000000,
      date: '14/01/2024',
      type: 'expense' as const,
    },
    {
      id: 'TXN003',
      description: 'Chi lương tháng 1',
      amount: 45000000,
      date: '13/01/2024',
      type: 'expense' as const,
    },
  ];

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
          Tình hình Tài chính
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

      {/* BigQuery Analytics Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          BigQuery Analytics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Thời gian phiên TB</p>
                  <p className="text-base font-bold">8p 32s</p>
                  <p className="text-xs text-green-600">+12% so với tháng trước</p>
                </div>
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tỷ lệ giữ chân KH</p>
                  <p className="text-base font-bold">78.5%</p>
                  <p className="text-xs text-green-600">+5.2% so với tháng trước</p>
                </div>
                <UserCheck className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tỷ lệ chuyển đổi</p>
                  <p className="text-base font-bold">24.8%</p>
                  <p className="text-xs text-red-600">-2.1% so với tháng trước</p>
                </div>
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Giá trị đơn hàng TB</p>
                  <p className="text-base font-bold">18.5M</p>
                  <p className="text-xs text-green-600">+8.3% so với tháng trước</p>
                </div>
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Behavior Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Phân khúc khách hàng hàng đầu (BigQuery)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span>Cặp đôi cưới (25-35 tuổi)</span>
                  <span className="font-medium">42.3%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div className="bg-blue-600 h-1 rounded-full" style={{ width: '42.3%' }}></div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Sự kiện doanh nghiệp</span>
                  <span className="font-medium">28.7%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div className="bg-green-600 h-1 rounded-full" style={{ width: '28.7%' }}></div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Chân dung gia đình</span>
                  <span className="font-medium">18.9%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div className="bg-purple-600 h-1 rounded-full" style={{ width: '18.9%' }}></div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Thời trang/Thương mại</span>
                  <span className="font-medium">10.1%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div className="bg-orange-600 h-1 rounded-full" style={{ width: '10.1%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Xu hướng doanh thu (BigQuery)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span>Mùa cao điểm (T10-T12)</span>
                  <span className="font-medium text-green-600">+45%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Mùa cưới (T4-T6)</span>
                  <span className="font-medium text-green-600">+38%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Doanh nghiệp Q4</span>
                  <span className="font-medium text-green-600">+22%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Mùa thấp điểm (T1-T3)</span>
                  <span className="font-medium text-red-600">-15%</span>
                </div>
                
                <div className="mt-2 p-1.5 bg-muted/30 rounded text-xs">
                  <strong>Thông tin chi tiết:</strong> Đặt chụp cưới tăng cao 6 tháng trước. Sự kiện doanh nghiệp có 30% tỷ lệ quay lại.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics */}
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Phân tích hiệu suất (BigQuery)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground">Hiệu quả nhiếp ảnh gia</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Thời gian chụp TB</span>
                    <span className="font-medium">4.2h</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Ảnh/giờ</span>
                    <span className="font-medium">85</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Hài lòng khách hàng</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground">Sử dụng thiết bị</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Tỷ lệ sử dụng máy ảnh</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Luân chuyển ống kính</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Cảnh báo bảo trì</span>
                    <span className="font-medium text-orange-600">3</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-muted-foreground">Thông tin kinh doanh</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Tỷ suất lợi nhuận</span>
                    <span className="font-medium text-green-600">34.2%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Chi phí thu hút KH</span>
                    <span className="font-medium">2.8M</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Giá trị trọn đời</span>
                    <span className="font-medium">45.6M</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" />
            Tạo Show mới
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <DollarSign className="h-3 w-3" />
            Ghi nhận thanh toán
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <FileText className="h-3 w-3" />
            Báo cáo
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <UserPlus className="h-3 w-3" />
            Quản lý nhân viên
          </Button>
        </div>
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