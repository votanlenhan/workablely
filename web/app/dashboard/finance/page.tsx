'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator,
  Wallet,
  Heart,
  Users,
  TrendingUp,
  ArrowUpCircle,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  AlertCircle,
  Calendar,
  Target
} from 'lucide-react';

const financeOverview = {
  cashStart: 120000000,
  cashCurrent: 145000000,
  totalSalary: 85000000,
  externalIncome: 25000000,
  monthlyTarget: 500000000,
  currentRevenue: 450000000
};

const recentTransactions = [
  { type: 'income', description: 'Show Wedding - Nguyễn A', amount: 25000000, date: '2024-01-20' },
  { type: 'expense', description: 'Lương tháng 1 - Đội ngũ', amount: -15000000, date: '2024-01-19' },
  { type: 'income', description: 'Thu ngoài - Bán thiết bị', amount: 5000000, date: '2024-01-18' },
  { type: 'expense', description: 'Wishlist - Lens Canon RF 70-200', amount: -12000000, date: '2024-01-17' },
];

const wishlistData = [
  { id: 1, item: 'Camera Canon R5', category: 'Camera', priority: 'Cao', estimatedCost: 95000000, status: 'Chờ duyệt' },
  { id: 2, item: 'Lens Sony 24-70 f/2.8', category: 'Lens', priority: 'Trung bình', estimatedCost: 48000000, status: 'Đã duyệt' },
  { id: 3, item: 'Studio Light Kit', category: 'Lighting', priority: 'Thấp', estimatedCost: 25000000, status: 'Chờ duyệt' },
];

const salaryData = [
  { id: 1, name: 'Nguyễn Văn A', role: 'Photographer', baseSalary: 15000000, bonus: 5000000, status: 'Đã chi' },
  { id: 2, name: 'Trần Thị B', role: 'Editor', baseSalary: 12000000, bonus: 3000000, status: 'Chưa chi' },
  { id: 3, name: 'Lê Văn C', role: 'Assistant', baseSalary: 8000000, bonus: 2000000, status: 'Chưa chi' },
];

const externalIncomeData = [
  { id: 1, source: 'Bán thiết bị cũ', amount: 15000000, date: '2024-01-15', category: 'Equipment' },
  { id: 2, source: 'Cho thuê studio', amount: 8000000, date: '2024-01-10', category: 'Rental' },
  { id: 3, source: 'Workshop nhiếp ảnh', amount: 12000000, date: '2024-01-05', category: 'Training' },
];

const periodClosingData = [
  { month: 'Tháng 12/2023', status: 'Đã chốt', cashStart: 100000000, cashEnd: 120000000, profit: 20000000 },
  { month: 'Tháng 11/2023', status: 'Đã chốt', cashStart: 85000000, cashEnd: 100000000, profit: 15000000 },
  { month: 'Tháng 10/2023', status: 'Đã chốt', cashStart: 90000000, cashEnd: 85000000, profit: -5000000 },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Calculator },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'salary', label: 'Chi lương', icon: Users },
    { id: 'external', label: 'Thu ngoài', icon: TrendingUp },
    { id: 'cash', label: 'Tiền mặt', icon: Wallet },
    { id: 'closing', label: 'Chốt sổ', icon: Calendar },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Quản lý Tài chính
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-background border-l border-r border-t border-border text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4" />
                    Tiền mặt
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-1">
                    <div className="text-lg font-bold">{formatCurrency(financeOverview.cashCurrent)}</div>
                    <div className="text-xs text-muted-foreground">
                      Đầu kỳ: {formatCurrency(financeOverview.cashStart)}
                    </div>
                    <div className="text-xs text-green-600">
                      +{((financeOverview.cashCurrent / financeOverview.cashStart - 1) * 100).toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    Chi lương
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-1">
                    <div className="text-lg font-bold">{formatCurrency(financeOverview.totalSalary)}</div>
                    <div className="text-xs text-muted-foreground">Tháng này</div>
                    <div className="text-xs text-muted-foreground">
                      {salaryData.filter(s => s.status === 'Chưa chi').length} chưa chi
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Thu ngoài
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-1">
                    <div className="text-lg font-bold">{formatCurrency(financeOverview.externalIncome)}</div>
                    <div className="text-xs text-muted-foreground">Tháng này</div>
                    <div className="text-xs text-green-600">
                      {externalIncomeData.length} giao dịch
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Giao dịch gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="h-3 w-3 text-red-600 rotate-180" />
                        )}
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Tổng ước tính: {formatCurrency(wishlistData.reduce((sum, item) => sum + item.estimatedCost, 0))}
              </div>
              <Button size="sm" className="h-8 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Thêm mục
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-2 font-medium">Mục</th>
                        <th className="text-left p-2 font-medium">Danh mục</th>
                        <th className="text-left p-2 font-medium">Ưu tiên</th>
                        <th className="text-left p-2 font-medium">Ước tính</th>
                        <th className="text-left p-2 font-medium">Trạng thái</th>
                        <th className="text-left p-2 font-medium w-20">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishlistData.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 font-medium">{item.item}</td>
                          <td className="p-2 text-muted-foreground">{item.category}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              item.priority === 'Cao' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : item.priority === 'Trung bình'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="p-2 font-medium">{formatCurrency(item.estimatedCost)}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              item.status === 'Đã duyệt' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Tổng lương tháng: {formatCurrency(salaryData.reduce((sum, s) => sum + s.baseSalary + s.bonus, 0))}
              </div>
              <Button size="sm" className="h-8 text-xs gap-1">
                <DollarSign className="h-3 w-3" />
                Chi lương hàng loạt
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-2 font-medium">Nhân viên</th>
                        <th className="text-left p-2 font-medium">Vai trò</th>
                        <th className="text-left p-2 font-medium">Lương cơ bản</th>
                        <th className="text-left p-2 font-medium">Thưởng</th>
                        <th className="text-left p-2 font-medium">Tổng</th>
                        <th className="text-left p-2 font-medium">Trạng thái</th>
                        <th className="text-left p-2 font-medium w-20">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryData.map((employee) => (
                        <tr key={employee.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 font-medium">{employee.name}</td>
                          <td className="p-2 text-muted-foreground">{employee.role}</td>
                          <td className="p-2">{formatCurrency(employee.baseSalary)}</td>
                          <td className="p-2 text-green-600">{formatCurrency(employee.bonus)}</td>
                          <td className="p-2 font-medium">{formatCurrency(employee.baseSalary + employee.bonus)}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              employee.status === 'Đã chi' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            }`}>
                              {employee.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {employee.status === 'Chưa chi' ? (
                              <Button variant="outline" size="sm" className="h-6 text-xs gap-1">
                                <Check className="h-3 w-3" />
                                Chi
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Đã chi</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'external' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Tổng thu ngoài tháng: {formatCurrency(externalIncomeData.reduce((sum, item) => sum + item.amount, 0))}
              </div>
              <Button size="sm" className="h-8 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Thêm thu ngoài
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-2 font-medium">Nguồn thu</th>
                        <th className="text-left p-2 font-medium">Danh mục</th>
                        <th className="text-left p-2 font-medium">Số tiền</th>
                        <th className="text-left p-2 font-medium">Ngày</th>
                        <th className="text-left p-2 font-medium w-20">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {externalIncomeData.map((income) => (
                        <tr key={income.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 font-medium">{income.source}</td>
                          <td className="p-2 text-muted-foreground">{income.category}</td>
                          <td className="p-2 font-medium text-green-600">{formatCurrency(income.amount)}</td>
                          <td className="p-2 text-muted-foreground">{income.date}</td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'cash' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4" />
                    Tiền mặt đầu kỳ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{formatCurrency(financeOverview.cashStart)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Số dư đầu tháng 1/2024</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4" />
                    Tiền mặt hiện tại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{formatCurrency(financeOverview.cashCurrent)}</div>
                  <p className="text-xs text-green-600 mt-1">
                    +{formatCurrency(financeOverview.cashCurrent - financeOverview.cashStart)} 
                    ({((financeOverview.cashCurrent / financeOverview.cashStart - 1) * 100).toFixed(1)}%)
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  Chốt sổ cuối kỳ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Tiền mặt cuối kỳ dự kiến</Label>
                      <div className="text-lg font-bold">{formatCurrency(financeOverview.cashCurrent)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Lợi nhuận kỳ</Label>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(financeOverview.cashCurrent - financeOverview.cashStart)}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-8 text-xs gap-1">
                    <Check className="h-3 w-3" />
                    Chốt sổ cuối tháng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'closing' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  Lịch sử chốt sổ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-2 font-medium">Kỳ</th>
                        <th className="text-left p-2 font-medium">Trạng thái</th>
                        <th className="text-left p-2 font-medium">Tiền đầu kỳ</th>
                        <th className="text-left p-2 font-medium">Tiền cuối kỳ</th>
                        <th className="text-left p-2 font-medium">Lợi nhuận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodClosingData.map((period, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/30">
                          <td className="p-2 font-medium">{period.month}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {period.status}
                            </span>
                          </td>
                          <td className="p-2">{formatCurrency(period.cashStart)}</td>
                          <td className="p-2">{formatCurrency(period.cashEnd)}</td>
                          <td className="p-2">
                            <span className={`font-medium ${
                              period.profit >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(period.profit)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 