'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useYear } from '@/lib/year-context';
import { 
  TrendingUp, 
  DollarSign, 
  Camera, 
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

const getRevenueStats = (year: number, month: number) => {
  // Tính số show đã hoàn thành (đã qua ngày chụp)
  const currentDate = new Date();
  const completedShows = 24; // Số show đã hoàn thành trong tháng
  const totalShowsInMonth = 30; // Tổng show đã nhận trong tháng
  
  // Tính số tiền đã thu và chưa thu
  const totalRevenue = 450000000;
  const collectedAmount = 325000000; // Đã thu
  const uncollectedAmount = totalRevenue - collectedAmount; // Chưa thu

  return [
    {
      title: 'Doanh thu tháng',
      value: totalRevenue,
      target: 500000000,
      progress: 90,
      change: '+8.2%',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Shows hoàn thành',
      value: completedShows,
      target: totalShowsInMonth,
      progress: Math.round((completedShows / totalShowsInMonth) * 100),
      change: '+12%',
      icon: Camera,
      color: 'text-blue-600',
    },
    {
      title: 'Đã thu',
      value: collectedAmount,
      target: uncollectedAmount,
      progress: Math.round((collectedAmount / totalRevenue) * 100),
      change: '+15%',
      icon: DollarSign,
      color: 'text-green-600',
    },
  ];
};

// Dữ liệu doanh thu 12 tháng với trung bình các năm trước và target
const getMonthlyRevenueData = (year: number) => [
  { month: 'T1', revenue: 350000000 + (year - 2024) * 10000000, target: 400000000, average: 320000000, previousYear: 300000000 },
  { month: 'T2', revenue: 420000000 + (year - 2024) * 12000000, target: 450000000, average: 380000000, previousYear: 360000000 },
  { month: 'T3', revenue: 380000000 + (year - 2024) * 8000000, target: 420000000, average: 350000000, previousYear: 340000000 },
  { month: 'T4', revenue: 450000000 + (year - 2024) * 15000000, target: 500000000, average: 420000000, previousYear: 400000000 },
  { month: 'T5', revenue: 520000000 + (year - 2024) * 18000000, target: 550000000, average: 480000000, previousYear: 460000000 },
  { month: 'T6', revenue: 480000000 + (year - 2024) * 14000000, target: 520000000, average: 450000000, previousYear: 430000000 },
  { month: 'T7', revenue: 560000000 + (year - 2024) * 20000000, target: 600000000, average: 520000000, previousYear: 500000000 },
  { month: 'T8', revenue: 540000000 + (year - 2024) * 16000000, target: 580000000, average: 500000000, previousYear: 480000000 },
  { month: 'T9', revenue: 490000000 + (year - 2024) * 12000000, target: 530000000, average: 460000000, previousYear: 440000000 },
  { month: 'T10', revenue: 580000000 + (year - 2024) * 22000000, target: 620000000, average: 540000000, previousYear: 520000000 },
  { month: 'T11', revenue: 620000000 + (year - 2024) * 25000000, target: 650000000, average: 580000000, previousYear: 560000000 },
  { month: 'T12', revenue: 680000000 + (year - 2024) * 30000000, target: 720000000, average: 640000000, previousYear: 620000000 },
];

// Dữ liệu phân tích theo loại show đầy đủ với các chỉ báo
const getShowTypesAnalysis = (year: number) => [
  { 
    type: 'Chụp TT', 
    revenue: 280000000 + (year - 2024) * 15000000, 
    percentage: 35, 
    shows: 12, 
    target: 320000000,
    average: 260000000,
    change: '+7.7%',
    color: 'bg-blue-500'
  },
  { 
    type: 'Event', 
    revenue: 150000000 + (year - 2024) * 8000000, 
    percentage: 19, 
    shows: 18, 
    target: 180000000,
    average: 140000000,
    change: '+7.1%',
    color: 'bg-green-500'
  },
  { 
    type: 'Chụp K.Y', 
    revenue: 120000000 + (year - 2024) * 6000000, 
    percentage: 15, 
    shows: 8, 
    target: 140000000,
    average: 110000000,
    change: '+9.1%',
    color: 'bg-purple-500'
  },
  { 
    type: 'Quay K.Y', 
    revenue: 95000000 + (year - 2024) * 5000000, 
    percentage: 12, 
    shows: 6, 
    target: 110000000,
    average: 85000000,
    change: '+11.8%',
    color: 'bg-orange-500'
  },
  { 
    type: 'Quay PSC', 
    revenue: 80000000 + (year - 2024) * 4000000, 
    percentage: 10, 
    shows: 4, 
    target: 90000000,
    average: 75000000,
    change: '+6.7%',
    color: 'bg-pink-500'
  },
  { 
    type: 'Chụp PSC', 
    revenue: 45000000 + (year - 2024) * 2000000, 
    percentage: 6, 
    shows: 5, 
    target: 50000000,
    average: 40000000,
    change: '+12.5%',
    color: 'bg-indigo-500'
  },
  { 
    type: 'Makeup', 
    revenue: 15000000 + (year - 2024) * 1000000, 
    percentage: 2, 
    shows: 12, 
    target: 20000000,
    average: 12000000,
    change: '+25%',
    color: 'bg-yellow-500'
  },
  { 
    type: 'Ảnh Thẻ', 
    revenue: 8000000 + (year - 2024) * 500000, 
    percentage: 1, 
    shows: 25, 
    target: 10000000,
    average: 7000000,
    change: '+14.3%',
    color: 'bg-gray-500'
  },
];

// Danh sách đầy đủ thanh toán chờ thu
const getAllPendingPayments = (year: number) => [
  {
    id: 'SH001',
    client: 'Nguyễn Văn A',
    amount: 45000000,
    dueDate: `${year}-01-20`,
    overdue: false,
    showType: 'Chụp TT',
    phone: '0901234567'
  },
  {
    id: 'SH005',
    client: 'Trần Thị E',
    amount: 32000000,
    dueDate: `${year}-01-18`,
    overdue: true,
    showType: 'Chụp K.Y',
    phone: '0912345678'
  },
  {
    id: 'SH008',
    client: 'Lê Văn H',
    amount: 28000000,
    dueDate: `${year}-01-25`,
    overdue: false,
    showType: 'Event',
    phone: '0923456789'
  },
  {
    id: 'SH012',
    client: 'Phạm Thị K',
    amount: 55000000,
    dueDate: `${year}-01-22`,
    overdue: false,
    showType: 'Chụp TT',
    phone: '0934567890'
  },
  {
    id: 'SH015',
    client: 'Hoàng Văn M',
    amount: 18000000,
    dueDate: `${year}-01-15`,
    overdue: true,
    showType: 'Quay K.Y',
    phone: '0945678901'
  },
  {
    id: 'SH018',
    client: 'Ngô Thị P',
    amount: 42000000,
    dueDate: `${year}-01-28`,
    overdue: false,
    showType: 'Quay PSC',
    phone: '0956789012'
  },
  {
    id: 'SH021',
    client: 'Đặng Văn Q',
    amount: 25000000,
    dueDate: `${year}-01-30`,
    overdue: false,
    showType: 'Chụp PSC',
    phone: '0967890123'
  },
  {
    id: 'SH024',
    client: 'Vũ Thị R',
    amount: 12000000,
    dueDate: `${year}-01-16`,
    overdue: true,
    showType: 'Event',
    phone: '0978901234'
  },
  {
    id: 'SH027',
    client: 'Bùi Văn S',
    amount: 38000000,
    dueDate: `${year}-02-02`,
    overdue: false,
    showType: 'Chụp TT',
    phone: '0989012345'
  },
  {
    id: 'SH030',
    client: 'Lý Thị T',
    amount: 22000000,
    dueDate: `${year}-02-05`,
    overdue: false,
    showType: 'Chụp K.Y',
    phone: '0990123456'
  },
];

export default function RevenuePage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [showAllPayments, setShowAllPayments] = useState(false);
  const { currentYear } = useYear();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const nextMonth = () => {
    setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);
  };

  const previousMonth = () => {
    setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
  };

  // Format số tiền không có ký tự tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format số tiền triệu
  const formatMillions = (amount: number) => {
    return (amount / 1000000).toFixed(1);
  };

  const revenueStats = getRevenueStats(currentYear, selectedMonth);
  const monthlyData = getMonthlyRevenueData(currentYear);
  const showTypesAnalysis = getShowTypesAnalysis(currentYear);
  const allPendingPayments = getAllPendingPayments(currentYear);
  const displayedPayments = showAllPayments ? allPendingPayments : allPendingPayments.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Dashboard Doanh thu - {currentYear}
        </h2>
        <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={previousMonth}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            {monthNames[selectedMonth - 1]}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={nextMonth}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {revenueStats.map((stat, index) => {
          const Icon = stat.icon;
          const isNumber = typeof stat.value === 'number';
          const displayValue = isNumber && stat.title !== 'Shows hoàn thành' 
            ? formatCurrency(stat.value) 
            : stat.value;
          const displayTarget = typeof stat.target === 'number' && stat.title !== 'Shows hoàn thành'
            ? formatCurrency(stat.target)
            : stat.target;
          
          // Custom target label based on stat type
          let targetLabel = 'Target';
          if (stat.title === 'Shows hoàn thành') {
            targetLabel = 'Tổng nhận';
          } else if (stat.title === 'Đã thu') {
            targetLabel = 'Chưa thu';
          }

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
                  <div className="text-lg font-bold text-foreground">{displayValue}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{targetLabel}: {displayTarget}</span>
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

      {/* Show Types Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4" />
            Phân tích theo loại show
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {showTypesAnalysis.map((type, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${type.color}`}></div>
                    <span className="font-medium min-w-[70px]">{type.type}</span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-muted-foreground">{type.shows} shows</span>
                    <span className="font-medium">{formatMillions(type.revenue)}M</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${type.color}`}
                      style={{ width: `${Math.min((type.revenue / type.target) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{type.percentage}%</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Target: {formatMillions(type.target)}M</span>
                  <span className={type.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {type.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments - List đầy đủ */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Thanh toán chờ thu ({allPendingPayments.length})
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => setShowAllPayments(!showAllPayments)}
            >
              {showAllPayments ? 'Thu gọn' : 'Xem tất cả'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayedPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
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
                      <span>{payment.phone}</span>
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
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Tổng chờ thu: {allPendingPayments.length} khoản
              </span>
              <span className="text-red-600">
                Quá hạn: {allPendingPayments.filter(p => p.overdue).length} khoản
              </span>
            </div>
            <span className="font-medium">
              {formatCurrency(allPendingPayments.reduce((sum, p) => sum + p.amount, 0))}
            </span>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}