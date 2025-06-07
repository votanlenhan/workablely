'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator,
  Heart,
  Plus,
  X,
  Building,
  Zap,
  Droplets,
  Receipt,
  FileText,
  Wifi,
  Wrench,
  MoreHorizontal,
  AlertTriangle,
  Target,
  Wallet,
  ArrowUpCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { DatePickerInput } from '@/components/ui/date-picker';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

// Icon mapping for categories
const getIconForCategory = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'Tiền nhà': Building,
    'Điện': Zap,
    'Nước': Droplets,
    'Thuế': Receipt,
    'Bảo hiểm': FileText,
    'Internet': Wifi,
    'Bảo trì': Wrench,
    'Khác': MoreHorizontal
  };
  return iconMap[category] || MoreHorizontal;
};

// Prediction function from history
const predictExpenseFromHistory = (category: string, historicalData: any[]) => {
  const categoryHistory = historicalData.filter(item => item.category === category);
  if (categoryHistory.length === 0) return 0;
  
  // Use last month's data for prediction
  const lastMonth = categoryHistory[categoryHistory.length - 1];
  return lastMonth?.actual || 0;
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('budget');
  
  // Search states for different tables
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [wishlistSearchTerm, setWishlistSearchTerm] = useState('');
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');

  // Historical data for prediction
  const historicalFixedExpenses = [
    // November 2023
    { month: '2023-11', category: 'Tiền nhà', actual: 25000000 },
    { month: '2023-11', category: 'Điện', actual: 3500000 },
    { month: '2023-11', category: 'Nước', actual: 800000 },
    { month: '2023-11', category: 'Thuế', actual: 5000000 },
    { month: '2023-11', category: 'Bảo hiểm', actual: 2000000 },
    { month: '2023-11', category: 'Internet', actual: 500000 },
    // December 2023
    { month: '2023-12', category: 'Tiền nhà', actual: 25000000 },
    { month: '2023-12', category: 'Điện', actual: 4200000 },
    { month: '2023-12', category: 'Nước', actual: 900000 },
    { month: '2023-12', category: 'Thuế', actual: 5000000 },
    { month: '2023-12', category: 'Bảo hiểm', actual: 2000000 },
    { month: '2023-12', category: 'Internet', actual: 500000 },
    { month: '2023-12', category: 'Bảo trì', actual: 1500000 },
  ];

  // Fixed expenses state - Tháng hiện tại với ngày chi
  const [fixedExpenses, setFixedExpenses] = useState([
    {
      id: 1,
      category: 'Tiền nhà',
      predicted: predictExpenseFromHistory('Tiền nhà', historicalFixedExpenses),
      actual: 25000000,
      status: 'Đã chi',
      date: '2024-01-01',
      description: 'Tiền thuê mặt bằng studio tháng 1'
    },
    {
      id: 2,
      category: 'Điện',
      predicted: predictExpenseFromHistory('Điện', historicalFixedExpenses),
      actual: 3800000,
      status: 'Đã chi',
      date: '2024-01-15',
      description: 'Hóa đơn điện tháng 12/2023'
    },
    {
      id: 3,
      category: 'Nước',
      predicted: predictExpenseFromHistory('Nước', historicalFixedExpenses),
      actual: 0,
      status: 'Chưa chi',
      date: '',
      description: 'Hóa đơn nước tháng 12/2023'
    },
    {
      id: 4,
      category: 'Thuế',
      predicted: predictExpenseFromHistory('Thuế', historicalFixedExpenses),
      actual: 5000000,
      status: 'Đã chi',
      date: '2024-01-10',
      description: 'Thuế VAT quý 4/2023'
    },
    {
      id: 5,
      category: 'Bảo hiểm',
      predicted: predictExpenseFromHistory('Bảo hiểm', historicalFixedExpenses),
      actual: 2000000,
      status: 'Đã chi',
      date: '2024-01-05',
      description: 'Bảo hiểm thiết bị studio'
    },
    {
      id: 6,
      category: 'Internet',
      predicted: predictExpenseFromHistory('Internet', historicalFixedExpenses),
      actual: 500000,
      status: 'Đã chi',
      date: '2024-01-03',
      description: 'Cước internet tháng 1'
    }
  ]);

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState({
    category: '',
    predicted: 0,
    actual: 0,
    status: 'Chưa chi',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      item: 'Máy ảnh Canon R5 Mark II',
      category: 'Thiết bị',
      priority: 'Cao',
      estimatedCost: 85000000,
      status: 'Đang xem xét',
      notes: 'Cần để nâng cấp chất lượng ảnh'
    },
    {
      id: 2,
      item: 'Lens 24-70mm f/2.8',
      category: 'Thiết bị',
      priority: 'Trung bình',
      estimatedCost: 45000000,
      status: 'Đã duyệt',
      notes: 'Thay thế lens cũ bị hỏng'
    },
    {
      id: 3,
      item: 'Đèn studio LED mới',
      category: 'Thiết bị',
      priority: 'Thấp',
      estimatedCost: 15000000,
      status: 'Chờ duyệt',
      notes: 'Bổ sung thêm ánh sáng'
    }
  ]);

  const [isAddingWishlist, setIsAddingWishlist] = useState(false);
  const [editingWishlist, setEditingWishlist] = useState<number | null>(null);
  const [newWishlistItem, setNewWishlistItem] = useState({
    item: '',
    category: 'Thiết bị',
    priority: 'Trung bình',
    estimatedCost: 0,
    status: 'Chờ duyệt',
    notes: ''
  });

  // External Income state - Dữ liệu cả năm 2024
  const [externalIncomes, setExternalIncomes] = useState([
    // Tháng 1
    {
      id: 1,
      source: 'Bán thiết bị cũ',
      amount: 15000000,
      date: '2024-01-15',
      category: 'Bán thiết bị',
      description: 'Bán máy ảnh Canon 5D Mark IV',
      recordedBy: 'Admin'
    },
    {
      id: 2,
      source: 'Cho thuê studio',
      amount: 8000000,
      date: '2024-01-20',
      category: 'Cho thuê',
      description: 'Thuê studio 2 ngày cho công ty ABC',
      recordedBy: 'Admin'
    },
    {
      id: 3,
      source: 'Workshop nhiếp ảnh',
      amount: 12000000,
      date: '2024-01-25',
      category: 'Đào tạo',
      description: 'Workshop cơ bản về nhiếp ảnh cưới',
      recordedBy: 'Manager'
    },
    // Tháng 2
    {
      id: 4,
      source: 'Bán lens cũ',
      amount: 8500000,
      date: '2024-02-10',
      category: 'Bán thiết bị',
      description: 'Bán lens 70-200mm f/2.8',
      recordedBy: 'Admin'
    },
    {
      id: 5,
      source: 'Tư vấn setup studio',
      amount: 5000000,
      date: '2024-02-18',
      category: 'Tư vấn',
      description: 'Tư vấn thiết kế studio cho khách hàng',
      recordedBy: 'Manager'
    },
    // Tháng 3
    {
      id: 6,
      source: 'Workshop nâng cao',
      amount: 18000000,
      date: '2024-03-05',
      category: 'Đào tạo',
      description: 'Workshop nhiếp ảnh thương mại',
      recordedBy: 'Admin'
    },
    {
      id: 7,
      source: 'Cho thuê thiết bị',
      amount: 6000000,
      date: '2024-03-22',
      category: 'Cho thuê',
      description: 'Cho thuê bộ đèn studio 1 tuần',
      recordedBy: 'Manager'
    },
    // Tháng 4
    {
      id: 8,
      source: 'Bán backdrop cũ',
      amount: 3500000,
      date: '2024-04-08',
      category: 'Bán thiết bị',
      description: 'Bán bộ backdrop và stand',
      recordedBy: 'Admin'
    },
    // Tháng 5
    {
      id: 9,
      source: 'Workshop online',
      amount: 15000000,
      date: '2024-05-12',
      category: 'Đào tạo',
      description: 'Khóa học online về post-processing',
      recordedBy: 'Manager'
    },
    {
      id: 10,
      source: 'Cho thuê studio cuối tuần',
      amount: 10000000,
      date: '2024-05-25',
      category: 'Cho thuê',
      description: 'Thuê studio cho event công ty',
      recordedBy: 'Admin'
    },
    // Tháng 6
    {
      id: 11,
      source: 'Bán máy tính cũ',
      amount: 12000000,
      date: '2024-06-15',
      category: 'Bán thiết bị',
      description: 'Bán workstation edit cũ',
      recordedBy: 'Admin'
    },
    // Tháng 7
    {
      id: 12,
      source: 'Tư vấn workflow',
      amount: 7500000,
      date: '2024-07-03',
      category: 'Tư vấn',
      description: 'Tư vấn quy trình làm việc cho studio mới',
      recordedBy: 'Manager'
    },
    // Tháng 8
    {
      id: 13,
      source: 'Workshop mùa hè',
      amount: 20000000,
      date: '2024-08-10',
      category: 'Đào tạo',
      description: 'Workshop intensive 3 ngày',
      recordedBy: 'Admin'
    },
    // Tháng 9
    {
      id: 14,
      source: 'Cho thuê trang phục',
      amount: 4500000,
      date: '2024-09-18',
      category: 'Cho thuê',
      description: 'Cho thuê váy cưới và phụ kiện',
      recordedBy: 'Manager'
    },
    // Tháng 10
    {
      id: 15,
      source: 'Bán phụ kiện',
      amount: 6500000,
      date: '2024-10-22',
      category: 'Bán thiết bị',
      description: 'Bán bộ filter và tripod',
      recordedBy: 'Admin'
    },
    // Tháng 11
    {
      id: 16,
      source: 'Workshop cuối năm',
      amount: 25000000,
      date: '2024-11-15',
      category: 'Đào tạo',
      description: 'Workshop master class với nhiếp ảnh gia nổi tiếng',
      recordedBy: 'Admin'
    },
    // Tháng 12
    {
      id: 17,
      source: 'Cho thuê studio Noel',
      amount: 15000000,
      date: '2024-12-20',
      category: 'Cho thuê',
      description: 'Thuê studio trang trí Noel cho nhiều gia đình',
      recordedBy: 'Manager'
    }
  ]);

  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<number | null>(null);
  const [newIncome, setNewIncome] = useState({
    source: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Bán thiết bị',
    description: '',
    recordedBy: 'Admin'
  });

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedWishlist, setSelectedWishlist] = useState<any>(null);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);

  // Budget overview data
  const budgetOverview = {
    totalBudget: 200000000,
    fixedExpensesTotal: fixedExpenses.reduce((sum, exp) => sum + exp.actual, 0),
    wishlistBudget: 80000000,
    wishlistUsed: wishlistItems.reduce((sum, item) => 
      item.status === 'Đã duyệt' ? sum + item.estimatedCost : sum, 0
    ),
    externalIncome: externalIncomes.reduce((sum, income) => sum + income.amount, 0)
  };

  const availableWishlistFunds = budgetOverview.wishlistBudget - budgetOverview.wishlistUsed + budgetOverview.externalIncome;

  // CRUD Functions for Fixed Expenses
  const handleAddExpense = () => {
    if (newExpense.category) {
      const predicted = predictExpenseFromHistory(newExpense.category, historicalFixedExpenses);
      const id = Math.max(...fixedExpenses.map(e => e.id), 0) + 1;
      setFixedExpenses([...fixedExpenses, {
        id,
        ...newExpense,
        predicted: predicted || newExpense.predicted
      }]);
      setNewExpense({ 
        category: '', 
        predicted: 0, 
        actual: 0, 
        status: 'Chưa chi',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setIsAddingExpense(false);
    }
  };

  const handleEditExpense = (id: number) => {
    setEditingExpense(id);
  };

  const handleUpdateExpense = (id: number, updatedExpense: any) => {
    setFixedExpenses(fixedExpenses.map(exp => 
      exp.id === id ? { ...exp, ...updatedExpense } : exp
    ));
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) {
      setFixedExpenses(fixedExpenses.filter(exp => exp.id !== id));
    }
  };

  // CRUD Functions for Wishlist
  const handleAddWishlistItem = () => {
    if (newWishlistItem.item) {
      const id = Math.max(...wishlistItems.map(w => w.id), 0) + 1;
      setWishlistItems([...wishlistItems, { id, ...newWishlistItem }]);
      setNewWishlistItem({
        item: '',
        category: 'Thiết bị',
        priority: 'Trung bình',
        estimatedCost: 0,
        status: 'Chờ duyệt',
        notes: ''
      });
      setIsAddingWishlist(false);
    }
  };

  const handleEditWishlist = (id: number) => {
    setEditingWishlist(id);
  };

  const handleUpdateWishlist = (id: number, updatedItem: any) => {
    setWishlistItems(wishlistItems.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
    setEditingWishlist(null);
  };

  const handleDeleteWishlist = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa item này khỏi wishlist?')) {
      setWishlistItems(wishlistItems.filter(item => item.id !== id));
    }
  };

  // CRUD Functions for External Income
  const handleAddIncome = () => {
    if (newIncome.source && newIncome.amount > 0) {
      const id = Math.max(...externalIncomes.map(i => i.id), 0) + 1;
      setExternalIncomes([...externalIncomes, { id, ...newIncome }]);
      setNewIncome({
        source: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'Bán thiết bị',
        description: '',
        recordedBy: 'Admin'
      });
      setIsAddingIncome(false);
    }
  };

  const handleEditIncome = (id: number) => {
    setEditingIncome(id);
  };

  const handleUpdateIncome = (id: number, updatedIncome: any) => {
    setExternalIncomes(externalIncomes.map(income => 
      income.id === id ? { ...income, ...updatedIncome } : income
    ));
    setEditingIncome(null);
  };

  const handleDeleteIncome = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa khoản thu này?')) {
      setExternalIncomes(externalIncomes.filter(income => income.id !== id));
    }
  };

  const getVarianceColor = (predicted: number, actual: number) => {
    if (actual === 0) return 'text-gray-500';
    const variance = actual - predicted;
    return variance > 0 ? 'text-red-600' : 'text-green-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Cao': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Trung bình': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Thấp': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã chi':
      case 'Đã duyệt':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Chưa chi':
      case 'Chờ duyệt':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Đang xem xét':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Modal functions
  const openExpenseModal = (mode: 'add' | 'edit', expense?: any) => {
    setModalMode(mode);
    setSelectedExpense(expense || null);
    if (mode === 'add') {
      setNewExpense({
        category: '',
        predicted: 0,
        actual: 0,
        status: 'Chưa chi',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
    setIsExpenseModalOpen(true);
  };

  const openWishlistModal = (mode: 'add' | 'edit', item?: any) => {
    setModalMode(mode);
    setSelectedWishlist(item || null);
    if (mode === 'add') {
      setNewWishlistItem({
        item: '',
        category: 'Thiết bị',
        priority: 'Trung bình',
        estimatedCost: 0,
        status: 'Chờ duyệt',
        notes: ''
      });
    }
    setIsWishlistModalOpen(true);
  };

  const openIncomeModal = (mode: 'add' | 'edit', income?: any) => {
    setModalMode(mode);
    setSelectedIncome(income || null);
    if (mode === 'add') {
      setNewIncome({
        source: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'Bán thiết bị',
        description: '',
        recordedBy: 'Admin'
      });
    }
    setIsIncomeModalOpen(true);
  };

  // Filter functions
  const filteredExpenses = fixedExpenses.filter(expense => {
    return expenseSearchTerm === '' || 
      expense.category.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      expense.status.toLowerCase().includes(expenseSearchTerm.toLowerCase());
  });

  const filteredWishlist = wishlistItems.filter(item => {
    return wishlistSearchTerm === '' || 
      item.item.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
      item.priority.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
      item.status.toLowerCase().includes(wishlistSearchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(wishlistSearchTerm.toLowerCase());
  });

  const filteredIncomes = externalIncomes.filter(income => {
    return incomeSearchTerm === '' || 
      income.source.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
      income.category.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
      income.description.toLowerCase().includes(incomeSearchTerm.toLowerCase()) ||
      income.recordedBy.toLowerCase().includes(incomeSearchTerm.toLowerCase());
  });

  const tabs = [
    { id: 'budget', label: 'Dự toán & Chi phí cố định', icon: Calculator },
    { id: 'wishlist', label: 'Quản lý Wishlist', icon: Heart },
    { id: 'external-income', label: 'Thu ngoài', icon: DollarSign }
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dự toán & Quản lý Chi tiêu</h1>
        <div className="text-xs text-muted-foreground">
          Trang chủ yếu để nhập liệu - Thông tin tổng quan hiển thị ở Dashboard
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
        💡 <strong>Hướng dẫn:</strong> Click vào hàng để chỉnh sửa.
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tổng dự toán</p>
                <p className="text-base font-bold">{formatCurrency(budgetOverview.totalBudget)}</p>
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
                <p className="text-base font-bold">{formatCurrency(budgetOverview.fixedExpensesTotal)}</p>
                <p className="text-xs text-orange-600">Đã chi: {Math.round((budgetOverview.fixedExpensesTotal / 85000000) * 100)}%</p>
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
                <p className="text-base font-bold">{formatCurrency(availableWishlistFunds)}</p>
                <p className="text-xs text-green-600">Khả dụng: {Math.round((availableWishlistFunds / budgetOverview.wishlistBudget) * 100)}%</p>
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
                <p className="text-base font-bold">{formatCurrency(budgetOverview.externalIncome)}</p>
                <p className="text-xs text-green-600">Bổ sung quỹ Wishlist</p>
              </div>
              <ArrowUpCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alert */}
      {budgetOverview.wishlistUsed > budgetOverview.wishlistBudget * 0.8 && (
        <div className="flex items-center gap-2 p-2 bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 rounded-md text-xs">
          <AlertTriangle className="h-3 w-3" />
          Cảnh báo: Quỹ Wishlist đã sử dụng {Math.round((budgetOverview.wishlistUsed / budgetOverview.wishlistBudget) * 100)}%. 
          Quỹ khả dụng thực tế: {formatCurrency(availableWishlistFunds)}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'budget' && (
        <div className="space-y-3">
          {/* Variance Analysis Card */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Phân tích Dự báo Chi phí Cố định</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng dự báo</p>
                  <p className="text-sm font-bold">{formatCurrency(fixedExpenses.reduce((sum, exp) => sum + exp.predicted, 0))}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tổng thực tế</p>
                  <p className="text-sm font-bold">{formatCurrency(budgetOverview.fixedExpensesTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chênh lệch</p>
                  <p className={`text-sm font-bold ${getVarianceColor(
                    fixedExpenses.reduce((sum, exp) => sum + exp.predicted, 0),
                    budgetOverview.fixedExpensesTotal
                  )}`}>
                    {budgetOverview.fixedExpensesTotal - fixedExpenses.reduce((sum, exp) => sum + exp.predicted, 0) > 0 ? '+' : ''}
                    {formatCurrency(budgetOverview.fixedExpensesTotal - fixedExpenses.reduce((sum, exp) => sum + exp.predicted, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Expenses Management */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Quản lý Chi phí Cố định</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => openExpenseModal('add')}
                  className="h-6 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {/* Search for Fixed Expenses */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo danh mục, mô tả, trạng thái..."
                      value={expenseSearchTerm}
                      onChange={(e) => setExpenseSearchTerm(e.target.value)}
                      className="h-8 text-sm pl-7"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Lọc
                </Button>
              </div>
              
              <div className="admin-table-container">
                <div className="admin-table">
                  {/* Table Header */}
                  <div className="admin-table-header finance-table-grid">
                  <div>Danh mục</div>
                  <div>Dự báo</div>
                  <div>Thực tế</div>
                  <div>Ngày chi</div>
                  <div>Mô tả</div>
                  <div>Chênh lệch</div>
                  <div>Trạng thái</div>
                </div>



                {/* Expense Rows */}
                {filteredExpenses.map((expense) => {
                  const Icon = getIconForCategory(expense.category);
                  
                  return (
                    <div key={expense.id}>
                      {/* Desktop Table Layout */}
                      <div 
                        className="admin-table-row finance-table-grid cursor-pointer hover:bg-muted/30"
                        onClick={() => openExpenseModal('edit', expense)}
                      >
                        <div className="admin-table-cell">
                          <Icon className="h-3 w-3 mr-1" />
                          <span className="text-sm">{expense.category}</span>
                        </div>
                        <div className="admin-table-cell text-sm font-medium text-blue-600">{formatCurrency(expense.predicted)}</div>
                        <div className="admin-table-cell">
                          <span className="text-sm font-medium text-green-600">{formatCurrency(expense.actual)}</span>
                        </div>
                        <div className="admin-table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                            <span className="text-sm">{expense.date ? new Date(expense.date).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </div>
                        <div className="admin-table-cell text-muted-foreground">
                          <span className="text-sm truncate">{expense.description || '-'}</span>
                        </div>
                        <div className={`admin-table-cell text-sm ${getVarianceColor(expense.predicted, expense.actual)}`}>
                          {expense.actual - expense.predicted > 0 ? '+' : ''}
                          {formatCurrency(expense.actual - expense.predicted)}
                        </div>
                        <div className="admin-table-cell">
                          <span className={`px-1 py-0.5 rounded-full text-xs ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Card Layout */}
                      <div 
                        className="mobile-finance-card cursor-pointer"
                        onClick={() => openExpenseModal('edit', expense)}
                      >
                        <div className="mobile-finance-header">
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            <h3 className="font-medium text-sm">{expense.category}</h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                        
                        <div className="mobile-finance-details">
                          <div>
                            <span className="text-muted-foreground">Dự báo:</span>
                            <span className="font-medium text-blue-600">{formatCurrency(expense.predicted)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Thực tế:</span>
                            <span className="font-medium text-green-600">{formatCurrency(expense.actual)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chênh lệch:</span>
                            <span className={`font-medium ${getVarianceColor(expense.predicted, expense.actual)}`}>
                              {expense.actual - expense.predicted > 0 ? '+' : ''}
                              {formatCurrency(expense.actual - expense.predicted)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ngày chi:</span>
                            <span>{expense.date ? new Date(expense.date).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                          {expense.description && (
                            <div>
                              <span className="text-muted-foreground">Mô tả:</span>
                              <span className="text-sm">{expense.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="space-y-3">
          {/* Wishlist Budget Status */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Tình trạng Quỹ Wishlist</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Quỹ dự toán</p>
                  <p className="text-sm font-bold">{formatCurrency(budgetOverview.wishlistBudget)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Đã sử dụng</p>
                  <p className="text-sm font-bold text-orange-600">{formatCurrency(budgetOverview.wishlistUsed)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thu ngoài</p>
                  <p className="text-sm font-bold text-green-600">{formatCurrency(budgetOverview.externalIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Khả dụng</p>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(availableWishlistFunds)}</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full" 
                    style={{ width: `${Math.min((budgetOverview.wishlistUsed / budgetOverview.wishlistBudget) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đã sử dụng {Math.round((budgetOverview.wishlistUsed / budgetOverview.wishlistBudget) * 100)}% quỹ dự toán
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Management */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Quản lý Wishlist</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => openWishlistModal('add')}
                  className="h-6 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {/* Search for Wishlist */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo item, danh mục, ưu tiên, trạng thái..."
                      value={wishlistSearchTerm}
                      onChange={(e) => setWishlistSearchTerm(e.target.value)}
                      className="h-8 text-sm pl-7"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Lọc
                </Button>
              </div>
              
              <div className="admin-table-container">
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="wishlist-table-grid text-xs font-medium text-muted-foreground border-b pb-1">
                  <div>Item</div>
                  <div>Danh mục</div>
                  <div>Ưu tiên</div>
                  <div>Chi phí ước tính</div>
                  <div>Trạng thái</div>
                </div>



                {/* Wishlist Rows */}
                {filteredWishlist.map((item) => {
                  return (
                    <div key={item.id}>
                      {/* Desktop Table Layout */}
                      <div 
                        className="wishlist-table-grid py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => openWishlistModal('edit', item)}
                      >
                        <div className="font-medium">
                          {item.item}
                        </div>
                        <div>
                          {item.category}
                        </div>
                        <div>
                          <span className={`px-1 py-0.5 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div>
                          {formatCurrency(item.estimatedCost)}
                        </div>
                        <div>
                          <span className={`px-1 py-0.5 rounded-full text-xs ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Card Layout */}
                      <div 
                        className="mobile-finance-card cursor-pointer"
                        onClick={() => openWishlistModal('edit', item)}
                      >
                        <div className="mobile-finance-header">
                          <div>
                            <h3 className="font-medium text-sm">{item.item}</h3>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mobile-finance-details">
                          <div>
                            <span className="text-muted-foreground">Chi phí ước tính:</span>
                            <span className="font-medium">{formatCurrency(item.estimatedCost)}</span>
                          </div>
                          {item.notes && (
                            <div>
                              <span className="text-muted-foreground">Ghi chú:</span>
                              <span className="text-sm">{item.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* External Income Tab */}
      {activeTab === 'external-income' && (
        <div className="space-y-3">
          {/* External Income Overview */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Tổng quan Thu ngoài</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng thu năm</p>
                  <p className="text-sm font-bold">{formatCurrency(budgetOverview.externalIncome)}</p>
                  <p className="text-xs text-green-600">+15% so với năm trước</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thu tháng này</p>
                  <p className="text-sm font-bold">{formatCurrency(
                    externalIncomes
                      .filter(income => new Date(income.date).getMonth() === new Date().getMonth())
                      .reduce((sum, income) => sum + income.amount, 0)
                  )}</p>
                  <p className="text-xs text-blue-600">3 giao dịch</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nguồn chính</p>
                  <p className="text-sm font-bold">Bán thiết bị</p>
                  <p className="text-xs text-orange-600">42% tổng thu</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bổ sung Wishlist</p>
                  <p className="text-sm font-bold">{formatCurrency(budgetOverview.externalIncome)}</p>
                  <p className="text-xs text-green-600">Tự động cộng vào quỹ</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Income Breakdown */}


          {/* External Income Management */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Quản lý Thu ngoài</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => openIncomeModal('add')}
                  className="h-6 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              {/* Search for External Income */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo nguồn thu, danh mục, mô tả..."
                      value={incomeSearchTerm}
                      onChange={(e) => setIncomeSearchTerm(e.target.value)}
                      className="h-8 text-sm pl-7"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Lọc
                </Button>
              </div>
              
              <div className="admin-table-container">
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="income-table-grid text-xs font-medium text-muted-foreground border-b pb-1">
                    <div>Số tiền</div>
                    <div>Ngày</div>
                    <div>Danh mục</div>
                    <div>Nguồn thu & Mô tả</div>
                    <div>Người ghi</div>
                  </div>



                {/* Income Rows */}
                {filteredIncomes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((income) => {
                  return (
                    <div key={income.id}>
                      {/* Desktop Table Layout */}
                      <div 
                        className="income-table-grid py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => openIncomeModal('edit', income)}
                      >
                        <div className="font-bold text-green-600">
                          {formatCurrency(income.amount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(income.date).toLocaleDateString('vi-VN')}
                        </div>
                        <div>
                          <span className="px-1 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs">
                            {income.category}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          <div>
                            <div className="font-medium">{income.source}</div>
                            <div className="text-muted-foreground text-xs">{income.description}</div>
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          {income.recordedBy}
                        </div>
                      </div>

                      {/* Mobile Card Layout */}
                      <div 
                        className="mobile-finance-card cursor-pointer"
                        onClick={() => openIncomeModal('edit', income)}
                      >
                        <div className="mobile-finance-header">
                          <div>
                            <h3 className="font-medium text-sm">{income.source}</h3>
                            <p className="text-xs text-muted-foreground">{income.category}</p>
                          </div>
                          <span className="font-bold text-green-600 text-sm">
                            {formatCurrency(income.amount)}
                          </span>
                        </div>
                        
                        <div className="mobile-finance-details">
                          <div>
                            <span className="text-muted-foreground">Ngày:</span>
                            <span>{new Date(income.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Người ghi:</span>
                            <span>{income.recordedBy}</span>
                          </div>
                          {income.description && (
                            <div>
                              <span className="text-muted-foreground">Mô tả:</span>
                              <span className="text-sm">{income.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income by Category Analysis */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Phân tích Thu ngoài theo Danh mục</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {['Bán thiết bị', 'Cho thuê', 'Đào tạo', 'Tư vấn', 'Khác'].map(category => {
                  const categoryTotal = externalIncomes
                    .filter(income => income.category === category)
                    .reduce((sum, income) => sum + income.amount, 0);
                  const percentage = budgetOverview.externalIncome > 0 
                    ? Math.round((categoryTotal / budgetOverview.externalIncome) * 100) 
                    : 0;
                  
                  return (
                    <div key={category} className="text-center p-2 bg-muted/30 rounded">
                      <p className="text-xs font-medium">{category}</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(categoryTotal)}</p>
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border shadow-2xl rounded-lg p-4 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {modalMode === 'add' ? 'Thêm Chi phí Cố định' : 'Chỉnh sửa Chi phí Cố định'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpenseModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-foreground">Danh mục</Label>
                  <select 
                    id="category"
                    value={modalMode === 'edit' ? selectedExpense?.category || '' : newExpense.category}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedExpense) {
                        setSelectedExpense({...selectedExpense, category: e.target.value});
                      } else {
                        setNewExpense({...newExpense, category: e.target.value});
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Tiền nhà">Tiền nhà</option>
                    <option value="Điện">Điện</option>
                    <option value="Nước">Nước</option>
                    <option value="Thuế">Thuế</option>
                    <option value="Bảo hiểm">Bảo hiểm</option>
                    <option value="Internet">Internet</option>
                    <option value="Bảo trì">Bảo trì</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="predicted" className="text-sm font-medium text-foreground">Dự báo</Label>
                    <Input
                      id="predicted"
                      type="number"
                      placeholder="0"
                      value={modalMode === 'edit' ? selectedExpense?.predicted || 0 : newExpense.predicted}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedExpense) {
                          setSelectedExpense({...selectedExpense, predicted: Number(e.target.value)});
                        } else {
                          setNewExpense({...newExpense, predicted: Number(e.target.value)});
                        }
                      }}
                      className="mt-1 bg-background border-input h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="actual" className="text-sm font-medium text-foreground">Thực tế</Label>
                    <Input
                      id="actual"
                      type="number"
                      placeholder="0"
                      value={modalMode === 'edit' ? selectedExpense?.actual || 0 : newExpense.actual}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedExpense) {
                          setSelectedExpense({...selectedExpense, actual: Number(e.target.value)});
                        } else {
                          setNewExpense({...newExpense, actual: Number(e.target.value)});
                        }
                      }}
                      className="mt-1 bg-background border-input h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-foreground">Ngày chi</Label>
                  <Input
                    id="date"
                    type="date"
                    value={modalMode === 'edit' ? selectedExpense?.date || '' : newExpense.date}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedExpense) {
                        setSelectedExpense({...selectedExpense, date: e.target.value});
                      } else {
                        setNewExpense({...newExpense, date: e.target.value});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Mô tả chi tiết"
                    value={modalMode === 'edit' ? selectedExpense?.description || '' : newExpense.description}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedExpense) {
                        setSelectedExpense({...selectedExpense, description: e.target.value});
                      } else {
                        setNewExpense({...newExpense, description: e.target.value});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-foreground">Trạng thái</Label>
                  <select 
                    id="status"
                    value={modalMode === 'edit' ? selectedExpense?.status || 'Chưa chi' : newExpense.status}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedExpense) {
                        setSelectedExpense({...selectedExpense, status: e.target.value});
                      } else {
                        setNewExpense({...newExpense, status: e.target.value});
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                  >
                    <option value="Chưa chi">Chưa chi</option>
                    <option value="Đã chi">Đã chi</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="h-10"
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    if (modalMode === 'add') {
                      handleAddExpense();
                    } else if (modalMode === 'edit' && selectedExpense) {
                      handleUpdateExpense(selectedExpense.id, selectedExpense);
                    }
                    setIsExpenseModalOpen(false);
                  }}
                  className="h-10"
                >
                  {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Modal */}
      {isWishlistModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border shadow-2xl rounded-lg p-4 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {modalMode === 'add' ? 'Thêm Wishlist Item' : 'Chỉnh sửa Wishlist Item'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsWishlistModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="item" className="text-sm font-medium text-foreground">Tên Item</Label>
                  <Input
                    id="item"
                    placeholder="Tên thiết bị/dịch vụ"
                    value={modalMode === 'edit' ? selectedWishlist?.item || '' : newWishlistItem.item}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedWishlist) {
                        setSelectedWishlist({...selectedWishlist, item: e.target.value});
                      } else {
                        setNewWishlistItem({...newWishlistItem, item: e.target.value});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wishlist-category" className="text-sm font-medium text-foreground">Danh mục</Label>
                    <select 
                      id="wishlist-category"
                      value={modalMode === 'edit' ? selectedWishlist?.category || 'Thiết bị' : newWishlistItem.category}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedWishlist) {
                          setSelectedWishlist({...selectedWishlist, category: e.target.value});
                        } else {
                          setNewWishlistItem({...newWishlistItem, category: e.target.value});
                        }
                      }}
                      className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                    >
                      <option value="Thiết bị">Thiết bị</option>
                      <option value="Phần mềm">Phần mềm</option>
                      <option value="Đào tạo">Đào tạo</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority" className="text-sm font-medium text-foreground">Ưu tiên</Label>
                    <select 
                      id="priority"
                      value={modalMode === 'edit' ? selectedWishlist?.priority || 'Trung bình' : newWishlistItem.priority}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedWishlist) {
                          setSelectedWishlist({...selectedWishlist, priority: e.target.value});
                        } else {
                          setNewWishlistItem({...newWishlistItem, priority: e.target.value});
                        }
                      }}
                      className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                    >
                      <option value="Cao">Cao</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Thấp">Thấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="estimatedCost" className="text-sm font-medium text-foreground">Chi phí ước tính</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    placeholder="0"
                    value={modalMode === 'edit' ? selectedWishlist?.estimatedCost || 0 : newWishlistItem.estimatedCost}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedWishlist) {
                        setSelectedWishlist({...selectedWishlist, estimatedCost: Number(e.target.value)});
                      } else {
                        setNewWishlistItem({...newWishlistItem, estimatedCost: Number(e.target.value)});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="wishlist-status" className="text-sm font-medium text-foreground">Trạng thái</Label>
                  <select 
                    id="wishlist-status"
                    value={modalMode === 'edit' ? selectedWishlist?.status || 'Chờ duyệt' : newWishlistItem.status}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedWishlist) {
                        setSelectedWishlist({...selectedWishlist, status: e.target.value});
                      } else {
                        setNewWishlistItem({...newWishlistItem, status: e.target.value});
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                  >
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đang xem xét">Đang xem xét</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Từ chối">Từ chối</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-foreground">Ghi chú</Label>
                  <Input
                    id="notes"
                    placeholder="Ghi chú thêm"
                    value={modalMode === 'edit' ? selectedWishlist?.notes || '' : newWishlistItem.notes}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedWishlist) {
                        setSelectedWishlist({...selectedWishlist, notes: e.target.value});
                      } else {
                        setNewWishlistItem({...newWishlistItem, notes: e.target.value});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setIsWishlistModalOpen(false)}
                  className="h-10"
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    if (modalMode === 'add') {
                      handleAddWishlistItem();
                    } else if (modalMode === 'edit' && selectedWishlist) {
                      handleUpdateWishlist(selectedWishlist.id, selectedWishlist);
                    }
                    setIsWishlistModalOpen(false);
                  }}
                  className="h-10"
                >
                  {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* External Income Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border shadow-2xl rounded-lg p-4 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {modalMode === 'add' ? 'Thêm Thu ngoài' : 'Chỉnh sửa Thu ngoài'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsIncomeModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="amount" className="text-sm font-medium text-foreground">Số tiền</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={modalMode === 'edit' ? selectedIncome?.amount || 0 : newIncome.amount}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedIncome) {
                          setSelectedIncome({...selectedIncome, amount: Number(e.target.value)});
                        } else {
                          setNewIncome({...newIncome, amount: Number(e.target.value)});
                        }
                      }}
                      className="mt-1 bg-background border-input h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="income-date" className="text-sm font-medium text-foreground">Ngày</Label>
                    <Input
                      id="income-date"
                      type="date"
                      value={modalMode === 'edit' ? selectedIncome?.date || '' : newIncome.date}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedIncome) {
                          setSelectedIncome({...selectedIncome, date: e.target.value});
                        } else {
                          setNewIncome({...newIncome, date: e.target.value});
                        }
                      }}
                      className="mt-1 bg-background border-input h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="income-category" className="text-sm font-medium text-foreground">Danh mục</Label>
                  <select 
                    id="income-category"
                    value={modalMode === 'edit' ? selectedIncome?.category || 'Bán thiết bị' : newIncome.category}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedIncome) {
                        setSelectedIncome({...selectedIncome, category: e.target.value});
                      } else {
                        setNewIncome({...newIncome, category: e.target.value});
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                  >
                    <option value="Bán thiết bị">Bán thiết bị</option>
                    <option value="Cho thuê">Cho thuê</option>
                    <option value="Đào tạo">Đào tạo</option>
                    <option value="Tư vấn">Tư vấn</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="source" className="text-sm font-medium text-foreground">Nguồn thu</Label>
                  <Input
                    id="source"
                    placeholder="Nguồn thu"
                    value={modalMode === 'edit' ? selectedIncome?.source || '' : newIncome.source}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedIncome) {
                        setSelectedIncome({...selectedIncome, source: e.target.value});
                      } else {
                        setNewIncome({...newIncome, source: e.target.value});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="income-description" className="text-sm font-medium text-foreground">Mô tả</Label>
                  <Input
                    id="income-description"
                    placeholder="Mô tả chi tiết"
                    value={modalMode === 'edit' ? selectedIncome?.description || '' : newIncome.description}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedIncome) {
                        setSelectedIncome({...selectedIncome, description: e.target.value});
                      } else {
                        setNewIncome({...newIncome, description: e.target.value});
                      }
                    }}
                    className="mt-1 bg-background border-input h-9"
                  />
                </div>

                <div>
                  <Label htmlFor="recordedBy" className="text-sm font-medium text-foreground">Người ghi</Label>
                  <select 
                    id="recordedBy"
                    value={modalMode === 'edit' ? selectedIncome?.recordedBy || 'Admin' : newIncome.recordedBy}
                    onChange={(e) => {
                      if (modalMode === 'edit' && selectedIncome) {
                        setSelectedIncome({...selectedIncome, recordedBy: e.target.value});
                      } else {
                        setNewIncome({...newIncome, recordedBy: e.target.value});
                      }
                    }}
                    className="w-full mt-1 px-3 py-2 bg-background border-input border rounded-md text-foreground h-9"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="h-10"
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    if (modalMode === 'add') {
                      handleAddIncome();
                    } else if (modalMode === 'edit' && selectedIncome) {
                      handleUpdateIncome(selectedIncome.id, selectedIncome);
                    }
                    setIsIncomeModalOpen(false);
                  }}
                  className="h-10"
                >
                  {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
