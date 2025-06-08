'use client';

import { useState, useEffect } from 'react';
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
  Filter,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { DatePickerInput } from '@/components/ui/date-picker';
import { useYear } from '@/lib/year-context';

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
    'Bù lương thợ': Users,
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
  const { currentYear } = useYear();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [activeTab, setActiveTab] = useState('budget');
  
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

  // Search states for different tables
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [wishlistSearchTerm, setWishlistSearchTerm] = useState('');
  const [incomeSearchTerm, setIncomeSearchTerm] = useState('');
  const [salarySearchTerm, setSalarySearchTerm] = useState('');
  const [staffPaymentStatus, setStaffPaymentStatus] = useState<{[key: string]: boolean}>({});

  // Staff data with roles and salary details - ordered by priority
  const staffData = [
    // Founder roles (highest priority) - nhận % doanh thu
    {
      id: 'ST003',
      name: 'Đạt',
      role: 'Lead + Marketing',
      department: 'Đội ngũ quản lý',
      status: 'Hoạt động',
      avatar: 'Đ',
      priority: 1,
      founderRoles: ['Lead', 'Marketing'], // Lead: 2%, Marketing: 5%
      revenuePercentage: 7 // 2% + 5%
    },
    {
      id: 'ST002', 
      name: 'Huy',
      role: 'Art Director',
      department: 'Đội ngũ quản lý',
      status: 'Hoạt động',
      avatar: 'H',
      priority: 1,
      founderRoles: ['Art'],
      revenuePercentage: 5 // 5%
    },
    {
      id: 'ST001',
      name: 'An',
      role: 'Manager',
      department: 'Đội ngũ quản lý',
      status: 'Hoạt động',
      avatar: 'A',
      priority: 1,
      founderRoles: ['Manager'],
      revenuePercentage: 5 // 5%
    },
    // Photographer team
    {
      id: 'ST004',
      name: 'Minh',
      role: 'Key Photographer',
      department: 'Photographer',
      status: 'Hoạt động',
      avatar: 'M',
      priority: 2
    },
    {
      id: 'ST008',
      name: 'Tùng',
      role: 'Support Photographer',
      department: 'Photographer',
      status: 'Hoạt động',
      avatar: 'T',
      priority: 2
    },
    // Design team (remaining staff)
    {
      id: 'ST005',
      name: 'A Phúc',
      role: 'Pick',
      department: 'Design',
      status: 'Hoạt động',
      avatar: 'AP',
      priority: 2
    },
    {
      id: 'ST006',
      name: 'Long',
      role: 'Blend',
      department: 'Design',
      status: 'Hoạt động',
      avatar: 'L',
      priority: 2
    },
    {
      id: 'ST007',
      name: 'Lai',
      role: 'Retouch',
      department: 'Design',
      status: 'Hoạt động',
      avatar: 'La',
      priority: 2
    }
  ];

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

  // Fixed expenses state - Theo tháng được chọn
  const getFixedExpensesData = (year: number, month: number) => {
    const monthStr = month.toString().padStart(2, '0');
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    
    return [
      {
        id: 1,
        category: 'Tiền nhà',
        predicted: predictExpenseFromHistory('Tiền nhà', historicalFixedExpenses),
        actual: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 25000000 : 0,
        status: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 'Đã chi' : 'Chưa chi',
        date: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? `${year}-${monthStr}-01` : '',
        description: `Tiền thuê mặt bằng studio tháng ${month}`
      },
      {
        id: 2,
        category: 'Điện',
        predicted: predictExpenseFromHistory('Điện', historicalFixedExpenses),
        actual: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 3800000 : 0,
        status: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 'Đã chi' : 'Chưa chi',
        date: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? `${year}-${monthStr}-15` : '',
        description: `Hóa đơn điện tháng ${prevMonth}/${prevYear}`
      },
      {
        id: 3,
        category: 'Nước',
        predicted: predictExpenseFromHistory('Nước', historicalFixedExpenses),
        actual: month < currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 850000 : 0,
        status: month < currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 'Đã chi' : 'Chưa chi',
        date: month < currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? `${year}-${monthStr}-20` : '',
        description: `Hóa đơn nước tháng ${prevMonth}/${prevYear}`
      },
      {
        id: 4,
        category: 'Thuế',
        predicted: predictExpenseFromHistory('Thuế', historicalFixedExpenses),
        actual: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 5000000 : 0,
        status: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 'Đã chi' : 'Chưa chi',
        date: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? `${year}-${monthStr}-10` : '',
        description: `Thuế VAT tháng ${month}/${year}`
      },
      {
        id: 5,
        category: 'Bù lương thợ',
        predicted: predictExpenseFromHistory('Bù lương thợ', historicalFixedExpenses),
        actual: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 2500000 : 0,
        status: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 'Đã chi' : 'Chưa chi',
        date: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? `${year}-${monthStr}-05` : '',
        description: 'Bù lương thợ do discount show'
      },
      {
        id: 6,
        category: 'Internet',
        predicted: predictExpenseFromHistory('Internet', historicalFixedExpenses),
        actual: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 500000 : 0,
        status: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? 'Đã chi' : 'Chưa chi',
        date: month <= currentDate.getMonth() + 1 && year <= currentDate.getFullYear() ? `${year}-${monthStr}-03` : '',
        description: `Cước internet tháng ${month}`
      }
    ];
  };

  const [fixedExpenses, setFixedExpenses] = useState(getFixedExpensesData(currentYear, selectedMonth));

  // Function to calculate detailed salary for each staff member
  const getStaffSalaryDetails = (staffId: string, year: number, month: number) => {
    // Doanh thu tháng để tính % founder
    const monthlyRevenue = 450000000; // Doanh thu tháng hiện tại
    
    // Mock data for salary calculation - in real app this would come from shows and assignments
    const salaryBreakdown = {
      'ST001': { // An - Manager (Founder)
        showEarnings: [
          { showId: 'SH001', showName: 'Wedding Nguyễn - Trần', role: 'Key Photographer', amount: 2500000, date: '2025-01-05' },
          { showId: 'SH002', showName: 'Prewedding Lê - Phạm', role: 'Key Photographer', amount: 1800000, date: '2025-01-12' },
          { showId: 'SH003', showName: 'Event ABC Company', role: 'Key Photographer', amount: 1200000, date: '2025-01-18' }
        ],
        additionalCosts: [
          { type: 'Manager (5% doanh thu)', amount: monthlyRevenue * 0.05, description: 'Phí quản lý 5% doanh thu tháng' },
          { type: 'Xăng xe', amount: 300000, description: 'Chi phí di chuyển tháng 1' },
          { type: 'Ăn uống', amount: 200000, description: 'Chi phí ăn uống khi chụp' }
        ],
        advances: [
          { type: 'Tạm ứng lương', amount: 1000000, description: 'Ứng trước ngày 15/01', wishlistId: 'WL001' }
        ]
      },
      'ST002': { // Huy - Art Director (Founder)
        showEarnings: [
          { showId: 'SH004', showName: 'Wedding Hoàng - Mai', role: 'Support Photographer 1', amount: 1600000, date: '2025-01-08' },
          { showId: 'SH005', showName: 'Birthday Party VIP', role: 'Support Photographer 1', amount: 1050000, date: '2025-01-15' }
        ],
        additionalCosts: [
          { type: 'Art Director (5% doanh thu)', amount: monthlyRevenue * 0.05, description: 'Phí art direction 5% doanh thu tháng' },
          { type: 'Thiết bị', amount: 400000, description: 'Mua thêm thẻ nhớ' }
        ],
        advances: []
      },
      'ST003': { // Đạt - Lead + Marketing (Founder)
        showEarnings: [
          { showId: 'SH001', showName: 'Wedding Nguyễn - Trần', role: 'Support Photographer 2', amount: 1500000, date: '2025-01-05' },
          { showId: 'SH006', showName: 'Corporate Event', role: 'Support Photographer 2', amount: 900000, date: '2025-01-20' }
        ],
        additionalCosts: [
          { type: 'Lead (2% doanh thu)', amount: monthlyRevenue * 0.02, description: 'Phí lead 2% doanh thu tháng' },
          { type: 'Marketing (5% doanh thu)', amount: monthlyRevenue * 0.05, description: 'Phí marketing 5% doanh thu tháng' }
        ],
        advances: [
          { type: 'Ứng cá nhân', amount: 500000, description: 'Ứng tiền cá nhân', wishlistId: 'WL002' }
        ]
      },
      'ST005': { // A Phúc - Pick
        showEarnings: [
          { showId: 'SH001', showName: 'Wedding Nguyễn - Trần', role: 'Pick', amount: 400000, date: '2025-01-07' },
          { showId: 'SH002', showName: 'Prewedding Lê - Phạm', role: 'Pick', amount: 300000, date: '2025-01-14' },
          { showId: 'SH004', showName: 'Wedding Hoàng - Mai', role: 'Pick', amount: 450000, date: '2025-01-10' }
        ],
        additionalCosts: [],
        advances: []
      },
      'ST006': { // Long - Blend
        showEarnings: [
          { showId: 'SH001', showName: 'Wedding Nguyễn - Trần', role: 'Blend', amount: 900000, date: '2025-01-08' },
          { showId: 'SH004', showName: 'Wedding Hoàng - Mai', role: 'Blend', amount: 1200000, date: '2025-01-12' }
        ],
        additionalCosts: [
          { type: 'Phần mềm', amount: 150000, description: 'License Photoshop tháng 1' }
        ],
        advances: []
      },
      'ST007': { // Lai - Retouch
        showEarnings: [
          { showId: 'SH002', showName: 'Prewedding Lê - Phạm', role: 'Retouch', amount: 700000, date: '2025-01-16' },
          { showId: 'SH005', showName: 'Birthday Party VIP', role: 'Retouch', amount: 525000, date: '2025-01-18' }
        ],
        additionalCosts: [],
        advances: [
          { type: 'Ứng lương', amount: 300000, description: 'Ứng tiền khẩn cấp', wishlistId: 'WL003' }
        ]
      },
      'ST004': { // Minh - Key Photographer
        showEarnings: [
          { showId: 'SH007', showName: 'Wedding Phạm - Nguyễn', role: 'Key Photographer', amount: 3000000, date: '2025-01-10' },
          { showId: 'SH008', showName: 'Corporate Event XYZ', role: 'Key Photographer', amount: 2200000, date: '2025-01-22' }
        ],
        additionalCosts: [
          { type: 'Xăng xe', amount: 400000, description: 'Chi phí di chuyển chụp ngoại cảnh' }
        ],
        advances: []
      },
      'ST008': { // Tùng - Support Photographer
        showEarnings: [
          { showId: 'SH007', showName: 'Wedding Phạm - Nguyễn', role: 'Support Photographer', amount: 1800000, date: '2025-01-10' },
          { showId: 'SH009', showName: 'Birthday Party Premium', role: 'Support Photographer', amount: 1400000, date: '2025-01-25' }
        ],
        additionalCosts: [],
        advances: [
          { type: 'Ứng lương', amount: 800000, description: 'Ứng tiền cá nhân', wishlistId: 'WL004' }
        ]
      }

    };

    const staffSalary = salaryBreakdown[staffId] || { 
      showEarnings: [], 
      additionalCosts: [], 
      advances: [] 
    };

    const totalShowEarnings = staffSalary.showEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const totalAdditionalCosts = staffSalary.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalAdvances = staffSalary.advances.reduce((sum, advance) => sum + advance.amount, 0);
    const totalSalary = totalShowEarnings + totalAdditionalCosts - totalAdvances;

    return {
      ...staffSalary,
      totalShowEarnings,
      totalAdditionalCosts,
      totalAdvances,
      totalSalary
    };
  };

  // Filter and sort staff for salary tab
  const filteredStaff = staffData
    .filter(staff => {
      return salarySearchTerm === '' || 
        staff.name.toLowerCase().includes(salarySearchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(salarySearchTerm.toLowerCase()) ||
        staff.department.toLowerCase().includes(salarySearchTerm.toLowerCase()) ||
        staff.id.toLowerCase().includes(salarySearchTerm.toLowerCase());
    })
    .sort((a, b) => {
      // Sort by priority: Manager (1) -> Multi-role staff (2) -> Design team (3)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Within same priority, sort by total shows/earnings (descending)
      const aSalaryDetail = getStaffSalaryDetails(a.id, currentYear, selectedMonth);
      const bSalaryDetail = getStaffSalaryDetails(b.id, currentYear, selectedMonth);
      
      // Sort by number of shows first, then by total earnings
      const aShowCount = aSalaryDetail.showEarnings?.length || 0;
      const bShowCount = bSalaryDetail.showEarnings?.length || 0;
      
      if (aShowCount !== bShowCount) {
        return bShowCount - aShowCount; // More shows first
      }
      
      // If same number of shows, sort by total earnings
      return bSalaryDetail.totalShowEarnings - aSalaryDetail.totalShowEarnings;
    });

  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  
  // Salary detail modal state
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState<string | null>(null);
  const [salaryDetailModalOpen, setSalaryDetailModalOpen] = useState(false);
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

  // Update data when year changes
  useEffect(() => {
    setFixedExpenses(getFixedExpensesData(currentYear, selectedMonth));
    setExternalIncomes(getExternalIncomesData(currentYear, selectedMonth));
  }, [currentYear, selectedMonth]);

  // External Income state - Dữ liệu theo tháng được chọn
  const getExternalIncomesData = (year: number, month: number) => {
    // Chỉ hiển thị data cho tháng hiện tại và các tháng trước đó
    if (month > currentDate.getMonth() + 1 && year >= currentDate.getFullYear()) {
      return [];
    }
    
    const allIncomes = [
    // Tháng 1
    {
      id: 1,
      source: 'Bán thiết bị cũ',
      amount: 15000000,
      date: `${year}-01-15`,
      category: 'Bán thiết bị',
      description: 'Bán máy ảnh Canon 5D Mark IV',
      recordedBy: 'Admin'
    },
    {
      id: 2,
      source: 'Cho thuê studio',
      amount: 8000000,
      date: `${year}-01-20`,
      category: 'Cho thuê',
      description: 'Thuê studio 2 ngày cho công ty ABC',
      recordedBy: 'Admin'
    },
    {
      id: 3,
      source: 'Workshop nhiếp ảnh',
      amount: 12000000,
      date: `${year}-01-25`,
      category: 'Đào tạo',
      description: 'Workshop cơ bản về nhiếp ảnh cưới',
      recordedBy: 'Manager'
    },
    // Tháng 2
    {
      id: 4,
      source: 'Bán lens cũ',
      amount: 8500000,
      date: `${year}-02-10`,
      category: 'Bán thiết bị',
      description: 'Bán lens 70-200mm f/2.8',
      recordedBy: 'Admin'
    },
    {
      id: 5,
      source: 'Tư vấn setup studio',
      amount: 5000000,
      date: `${year}-02-18`,
      category: 'Tư vấn',
      description: 'Tư vấn thiết kế studio cho khách hàng',
      recordedBy: 'Manager'
    },
    // Tháng 3
    {
      id: 6,
      source: 'Workshop nâng cao',
      amount: 18000000,
      date: `${year}-03-05`,
      category: 'Đào tạo',
      description: 'Workshop nhiếp ảnh thương mại',
      recordedBy: 'Admin'
    },
    {
      id: 7,
      source: 'Cho thuê thiết bị',
      amount: 6000000,
      date: `${year}-03-22`,
      category: 'Cho thuê',
      description: 'Cho thuê bộ đèn studio 1 tuần',
      recordedBy: 'Manager'
    },
    // Tháng 4
    {
      id: 8,
      source: 'Bán backdrop cũ',
      amount: 3500000,
      date: `${year}-04-08`,
      category: 'Bán thiết bị',
      description: 'Bán bộ backdrop và stand',
      recordedBy: 'Admin'
    },
    // Tháng 5
    {
      id: 9,
      source: 'Workshop online',
      amount: 15000000,
      date: `${year}-05-12`,
      category: 'Đào tạo',
      description: 'Khóa học online về post-processing',
      recordedBy: 'Manager'
    },
    {
      id: 10,
      source: 'Cho thuê studio cuối tuần',
      amount: 10000000,
      date: `${year}-05-25`,
      category: 'Cho thuê',
      description: 'Thuê studio cho event công ty',
      recordedBy: 'Admin'
    },
    // Tháng 6
    {
      id: 11,
      source: 'Bán máy tính cũ',
      amount: 12000000,
      date: `${year}-06-15`,
      category: 'Bán thiết bị',
      description: 'Bán workstation edit cũ',
      recordedBy: 'Admin'
    },
    // Tháng 7
    {
      id: 12,
      source: 'Tư vấn workflow',
      amount: 7500000,
      date: `${year}-07-03`,
      category: 'Tư vấn',
      description: 'Tư vấn quy trình làm việc cho studio mới',
      recordedBy: 'Manager'
    },
    // Tháng 8
    {
      id: 13,
      source: 'Workshop mùa hè',
      amount: 20000000,
      date: `${year}-08-10`,
      category: 'Đào tạo',
      description: 'Workshop intensive 3 ngày',
      recordedBy: 'Admin'
    },
    // Tháng 9
    {
      id: 14,
      source: 'Cho thuê trang phục',
      amount: 4500000,
      date: `${year}-09-18`,
      category: 'Cho thuê',
      description: 'Cho thuê váy cưới và phụ kiện',
      recordedBy: 'Manager'
    },
    // Tháng 10
    {
      id: 15,
      source: 'Bán phụ kiện',
      amount: 6500000,
      date: `${year}-10-22`,
      category: 'Bán thiết bị',
      description: 'Bán bộ filter và tripod',
      recordedBy: 'Admin'
    },
    // Tháng 11
    {
      id: 16,
      source: 'Workshop cuối năm',
      amount: 25000000,
      date: `${year}-11-15`,
      category: 'Đào tạo',
      description: 'Workshop master class với nhiếp ảnh gia nổi tiếng',
      recordedBy: 'Admin'
    },
    // Tháng 12
    {
      id: 17,
      source: 'Cho thuê studio Noel',
      amount: 15000000,
      date: `${year}-12-20`,
      category: 'Cho thuê',
      description: 'Thuê studio trang trí Noel cho nhiều gia đình',
      recordedBy: 'Manager'
    }
  ];

  // Filter theo tháng được chọn
  return allIncomes.filter(income => {
    const incomeMonth = parseInt(income.date.split('-')[1]);
    return incomeMonth === month;
  });
};

  const [externalIncomes, setExternalIncomes] = useState(getExternalIncomesData(currentYear, selectedMonth));

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

  const openSalaryDetailModal = (staffId: string) => {
    setSelectedStaffForSalary(staffId);
    setSalaryDetailModalOpen(true);
  };

  const closeSalaryDetailModal = () => {
    setSelectedStaffForSalary(null);
    setSalaryDetailModalOpen(false);
  };

  // Function to automatically add advance payments to wishlist
  const addAdvanceToWishlist = (advance: any, staffName: string) => {
    const newWishlistItem = {
      id: Math.max(...wishlistItems.map(w => w.id), 0) + 1,
      item: `Ứng lương - ${staffName}`,
      category: 'Ứng lương',
      priority: 'Cao',
      estimatedCost: advance.amount,
      status: 'Đã duyệt',
      notes: `${advance.description} - Tự động từ hệ thống lương`
    };
    
    setWishlistItems(prev => [...prev, newWishlistItem]);
    return newWishlistItem.id;
  };

  // Function to add additional cost to wishlist
  const addCostToWishlist = (cost: any, staffName: string) => {
    const newWishlistItem = {
      id: Math.max(...wishlistItems.map(w => w.id), 0) + 1,
      item: `Chi phí - ${staffName}`,
      category: cost.type,
      priority: 'Trung bình',
      estimatedCost: cost.amount,
      status: 'Đã duyệt',
      notes: `${cost.description} - Tự động từ hệ thống lương`
    };
    
    setWishlistItems(prev => [...prev, newWishlistItem]);
    return newWishlistItem.id;
  };

  // States for adding new cost/advance in salary modal
  const [newCost, setNewCost] = useState({ type: '', amount: 0, description: '' });
  const [newAdvance, setNewAdvance] = useState({ type: '', amount: 0, description: '' });
  const [showAddCostForm, setShowAddCostForm] = useState(false);
  const [showAddAdvanceForm, setShowAddAdvanceForm] = useState(false);

  // Function to add new cost to staff salary
  const handleAddCost = () => {
    if (!selectedStaffForSalary || !newCost.type || !newCost.amount || !newCost.description) return;
    
    const staff = staffData.find(s => s.id === selectedStaffForSalary);
    if (!staff) return;

    // Add to wishlist
    const wishlistId = addCostToWishlist(newCost, staff.name);
    
    // Here you would update the staff salary data
    // For now, we'll just reset the form
    setNewCost({ type: '', amount: 0, description: '' });
    setShowAddCostForm(false);
    
    // You could also trigger a refresh of salary data here
  };

  // Function to add new advance to staff salary
  const handleAddAdvance = () => {
    if (!selectedStaffForSalary || !newAdvance.type || !newAdvance.amount || !newAdvance.description) return;
    
    const staff = staffData.find(s => s.id === selectedStaffForSalary);
    if (!staff) return;

    // Add to wishlist
    const wishlistId = addAdvanceToWishlist(newAdvance, staff.name);
    
    // Here you would update the staff salary data
    // For now, we'll just reset the form
    setNewAdvance({ type: '', amount: 0, description: '' });
    setShowAddAdvanceForm(false);
    
    // You could also trigger a refresh of salary data here
  };

  const handleDeleteCost = (staffId: string, costIndex: number) => {
    // In a real app, this would update the backend
    // For now, we'll just show a confirmation and simulate deletion
    if (confirm('Bạn có chắc chắn muốn xóa khoản cộng thêm này?')) {
      // This would typically make an API call to delete the cost
      console.log(`Deleting cost at index ${costIndex} for staff ${staffId}`);
      // Force re-render by updating a state
      setStaffPaymentStatus(prev => ({ ...prev }));
    }
  };

  const handleDeleteAdvance = (staffId: string, advanceIndex: number) => {
    // In a real app, this would update the backend
    // For now, we'll just show a confirmation and simulate deletion
    if (confirm('Bạn có chắc chắn muốn xóa khoản trừ bớt này?')) {
      // This would typically make an API call to delete the advance
      console.log(`Deleting advance at index ${advanceIndex} for staff ${staffId}`);
      // Force re-render by updating a state
      setStaffPaymentStatus(prev => ({ ...prev }));
    }
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
    { id: 'wishlist', label: 'Chi Wishlist', icon: Heart },
    { id: 'external-income', label: 'Thu ngoài', icon: DollarSign },
    { id: 'salary', label: 'Chi lương', icon: Users },
    { id: 'closing', label: 'Chốt sổ', icon: BookOpen }
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dự toán & Quản lý Chi tiêu - {currentYear}</h1>
        <div className="flex items-center gap-3">
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
      </div>
      
      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
        💡 <strong>Hướng dẫn:</strong> Click vào hàng để chỉnh sửa.
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
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

        <Card>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tiền mặt hiện tại</p>
                <p className="text-base font-bold text-blue-600">{formatCurrency((() => {
                  // Calculate actual paid salaries based on payment status
                  const actualPaidSalaries = filteredStaff.reduce((total, staff) => {
                    if (staffPaymentStatus[staff.id]) {
                      const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                      return total + salaryDetail.totalSalary;
                    }
                    return total;
                  }, 0);
                  
                  return 50000000 + 95000000 + budgetOverview.externalIncome - actualPaidSalaries - budgetOverview.wishlistUsed;
                })())}</p>
                <p className="text-xs text-blue-600">Thực tế hiện tại</p>
              </div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tiền mặt cuối kỳ</p>
                <p className="text-base font-bold text-purple-600">{formatCurrency((() => {
                  // Calculate estimated end-of-period cash (if all salaries are paid)
                  const totalSalaries = filteredStaff.reduce((sum, staff) => {
                    const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                    return sum + salaryDetail.totalSalary;
                  }, 0);
                  
                  return 50000000 + 95000000 + budgetOverview.externalIncome - totalSalaries - budgetOverview.wishlistUsed;
                })())}</p>
                <p className="text-xs text-purple-600">Ước tính</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
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
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="finance-table-grid text-xs font-medium text-muted-foreground border-b pb-1">
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
                        className="finance-table-grid py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => openExpenseModal('edit', expense)}
                      >
                        <div className="flex items-center">
                          <Icon className="h-3 w-3 mr-1" />
                          <span>{expense.category}</span>
                        </div>
                        <div className="font-medium text-blue-600">{formatCurrency(expense.predicted)}</div>
                        <div>
                          <span className="font-medium text-green-600">{formatCurrency(expense.actual)}</span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                            <span>{expense.date ? new Date(expense.date).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="truncate">{expense.description || '-'}</span>
                        </div>
                        <div className={`${getVarianceColor(expense.predicted, expense.actual)}`}>
                          {expense.actual - expense.predicted > 0 ? '+' : ''}
                          {formatCurrency(expense.actual - expense.predicted)}
                        </div>
                        <div>
                          <span className={`px-1 py-0.5 rounded-full ${getStatusColor(expense.status)}`}>
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
                <CardTitle className="text-sm">Chi Wishlist</CardTitle>
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
                          <span className={`px-1 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div>
                          {formatCurrency(item.estimatedCost)}
                        </div>
                        <div>
                          <span className={`px-1 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
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

      {/* Salary Tab */}
      {activeTab === 'salary' && (
        <div className="space-y-3">
          {/* Salary Overview */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Tổng quan Chi lương - {monthNames[selectedMonth - 1]} {currentYear}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Tổng lương tháng</p>
                  <p className="text-sm font-bold text-primary">
                    {formatCurrency(filteredStaff.reduce((sum, staff) => {
                      const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                      return sum + salaryDetail.totalSalary;
                    }, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">{filteredStaff.length} nhân viên</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thu nhập từ shows</p>
                  <p className="text-sm font-bold text-blue-600">
                    {formatCurrency(filteredStaff.reduce((sum, staff) => {
                      const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                      return sum + salaryDetail.totalShowEarnings;
                    }, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Dựa trên hiệu suất</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trừ Bớt</p>
                  <p className="text-sm font-bold text-red-600">
                    {formatCurrency(filteredStaff.reduce((sum, staff) => {
                      const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                      return sum + salaryDetail.totalAdvances;
                    }, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Tạm ứng</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Summary */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Tổng hợp theo Phòng ban</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Đội ngũ quản lý', 'Photographer', 'Design'].map((dept) => {
                  const deptStaff = filteredStaff.filter(s => s.department === dept);
                  const deptTotal = deptStaff.reduce((sum, staff) => {
                    const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                    return sum + salaryDetail.totalSalary;
                  }, 0);
                  
                  return (
                    <div key={dept} className="p-3 bg-muted/30 rounded-lg">
                      <h3 className="font-medium text-sm mb-2">{dept}</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Số người:</span>
                          <span className="font-medium">{deptStaff.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Tổng:</span>
                          <span className="font-bold text-primary">{formatCurrency(deptTotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>TB:</span>
                          <span className="font-medium">{formatCurrency(deptStaff.length > 0 ? deptTotal / deptStaff.length : 0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>



          {/* Staff Salary List */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Danh sách Lương Nhân viên</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm nhân viên..."
                      value={salarySearchTerm}
                      onChange={(e) => setSalarySearchTerm(e.target.value)}
                      className="h-8 text-sm pl-7 w-48"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStaff.map((staff) => {
                  const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                  return (
                    <div 
                      key={staff.id}
                      className="p-3 border border-border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => openSalaryDetailModal(staff.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                          {staff.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{staff.name}</div>
                          <div className="text-xs text-muted-foreground">{staff.role}</div>
                          <div className="text-xs text-muted-foreground">{staff.department} • {staff.id}</div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Tổng lương:</span>
                          <span className="font-bold text-primary">{formatCurrency(salaryDetail.totalSalary)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Shows:</span>
                          <span className="text-blue-600">{formatCurrency(salaryDetail.totalShowEarnings)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Cộng thêm:</span>
                          <span className="text-green-600">{formatCurrency(salaryDetail.totalAdditionalCosts)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Trừ bớt:</span>
                          <span className="text-red-600">{formatCurrency(salaryDetail.totalAdvances)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t">
                          <span>Trạng thái:</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            staffPaymentStatus[staff.id] 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                          }`}>
                            {staffPaymentStatus[staff.id] ? 'Đã chi' : 'Chưa chi'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Closing Tab */}
      {activeTab === 'closing' && (
        <div className="space-y-3">
          {/* Monthly Summary */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Chốt sổ Tháng 1/2025</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revenue Section */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-green-600">📈 Thu nhập</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Doanh thu từ Shows</span>
                      <span className="font-medium">{formatCurrency(120000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Thu ngoài</span>
                      <span className="font-medium">{formatCurrency(budgetOverview.externalIncome)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Tổng thu</span>
                      <span className="font-bold text-green-600">{formatCurrency(120000000 + budgetOverview.externalIncome)}</span>
                    </div>
                  </div>
                </div>

                {/* Expense Section */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-red-600">📉 Chi phí</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Chi phí cố định</span>
                      <span className="font-medium">{formatCurrency(budgetOverview.fixedExpensesTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Chi lương (dự kiến)</span>
                      <span className="font-medium">{formatCurrency(45000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Chi Wishlist</span>
                      <span className="font-medium">{formatCurrency(budgetOverview.wishlistUsed)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Tổng chi</span>
                      <span className="font-bold text-red-600">{formatCurrency(budgetOverview.fixedExpensesTotal + 45000000 + budgetOverview.wishlistUsed)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="mt-4 p-3 bg-muted/30 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Lợi nhuận ròng</span>
                  <span className={`font-bold text-lg ${
                    (120000000 + budgetOverview.externalIncome) - (budgetOverview.fixedExpensesTotal + 45000000 + budgetOverview.wishlistUsed) > 0
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency((120000000 + budgetOverview.externalIncome) - (budgetOverview.fixedExpensesTotal + 45000000 + budgetOverview.wishlistUsed))}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tỷ lệ lợi nhuận: {Math.round(((120000000 + budgetOverview.externalIncome) - (budgetOverview.fixedExpensesTotal + 45000000 + budgetOverview.wishlistUsed)) / (120000000 + budgetOverview.externalIncome) * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Dòng tiền</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Tiền mặt đầu kỳ</span>
                  <span className="font-medium">{formatCurrency(50000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Đã thu trong kỳ</span>
                  <span className="font-medium text-green-600">+{formatCurrency(95000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Thu ngoài trong kỳ</span>
                  <span className="font-medium text-green-600">+{formatCurrency(budgetOverview.externalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Chi lương (thực chi)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(35000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Chi Wishlist (thực chi)</span>
                  <span className="font-medium text-red-600">-{formatCurrency(budgetOverview.wishlistUsed)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Tiền mặt hiện tại</span>
                  <span className="font-bold text-blue-600">{formatCurrency((() => {
                    // Calculate actual paid salaries based on payment status
                    const actualPaidSalaries = filteredStaff.reduce((total, staff) => {
                      if (staffPaymentStatus[staff.id]) {
                        const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                        return total + salaryDetail.totalSalary;
                      }
                      return total;
                    }, 0);
                    
                    return 50000000 + 95000000 + budgetOverview.externalIncome - actualPaidSalaries - budgetOverview.wishlistUsed;
                  })())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tiền mặt cuối kỳ (ước tính)</span>
                  <span className="font-bold text-purple-600">{formatCurrency(50000000 + 95000000 + budgetOverview.externalIncome - 45000000 - budgetOverview.wishlistUsed)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Payments */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Công nợ phải thu</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                {[
                  { customer: 'Công ty ABC', amount: 15000000, dueDate: '2025-02-15', overdue: false },
                  { customer: 'Anh Minh - Wedding', amount: 8000000, dueDate: '2025-01-30', overdue: true },
                  { customer: 'Chị Lan - Event', amount: 12000000, dueDate: '2025-02-10', overdue: false }
                ].map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{debt.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        Hạn: {new Date(debt.dueDate).toLocaleDateString('vi-VN')}
                        {debt.overdue && <span className="text-red-600 ml-1">(Quá hạn)</span>}
                      </div>
                    </div>
                    <div className={`font-bold ${debt.overdue ? 'text-red-600' : 'text-orange-600'}`}>
                      {formatCurrency(debt.amount)}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Tổng công nợ</span>
                  <span className="font-bold text-orange-600">{formatCurrency(35000000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              Xuất báo cáo tháng
            </Button>
            <Button variant="outline" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              So sánh tháng trước
            </Button>
          </div>
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

      {/* Salary Detail Modal */}
      {salaryDetailModalOpen && selectedStaffForSalary && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border shadow-2xl rounded-lg p-4 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Chi tiết Lương - {staffData.find(s => s.id === selectedStaffForSalary)?.name}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSalaryDetailModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {(() => {
              const staff = staffData.find(s => s.id === selectedStaffForSalary);
              const salaryDetail = getStaffSalaryDetails(selectedStaffForSalary, currentYear, selectedMonth);
              
              if (!staff) return null;

              return (
                <div className="space-y-4">
                  {/* Staff Info */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">
                      {staff.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium">{staff.name}</h4>
                      <p className="text-sm text-muted-foreground">{staff.role} • {staff.department}</p>
                      <p className="text-xs text-muted-foreground">{staff.id} • {staff.status}</p>
                    </div>
                  </div>

                  {/* Salary Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Thu nhập shows</p>
                      <p className="font-bold text-blue-600">{formatCurrency(salaryDetail.totalShowEarnings)}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Cộng Thêm</p>
                      <p className="font-bold text-green-600">+{formatCurrency(salaryDetail.totalAdditionalCosts)}</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">Trừ Bớt</p>
                      <p className="font-bold text-red-600">-{formatCurrency(salaryDetail.totalAdvances)}</p>
                    </div>
                  </div>

                  {/* Total Salary */}
                  <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Tổng lương tháng {selectedMonth}:</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(salaryDetail.totalSalary)}</span>
                    </div>
                    
                    {/* Payment Status Switch */}
                    <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                      <span className="text-sm font-medium">Trạng thái chi trả:</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${!staffPaymentStatus[selectedStaffForSalary] ? 'font-medium' : 'text-muted-foreground'}`}>
                          Chưa chi
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={staffPaymentStatus[selectedStaffForSalary] || false}
                            onChange={(e) => {
                              const newStatus = e.target.checked;
                              setStaffPaymentStatus(prev => ({
                                ...prev,
                                [selectedStaffForSalary]: newStatus
                              }));
                              
                              // Update cash flow when payment status changes
                              // This would affect the "Tiền mặt hiện tại" calculation
                              // The logic should subtract/add the salary amount from current cash
                            }}
                            className="sr-only"
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors relative ${
                            staffPaymentStatus[selectedStaffForSalary] 
                              ? 'bg-blue-600' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 dark:border-gray-600 rounded-full h-5 w-5 transition-transform ${
                              staffPaymentStatus[selectedStaffForSalary] 
                                ? 'translate-x-5' 
                                : 'translate-x-0'
                            }`}></div>
                          </div>
                        </label>
                        <span className={`text-sm ${staffPaymentStatus[selectedStaffForSalary] ? 'font-medium' : 'text-muted-foreground'}`}>
                          Đã chi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Show Earnings Detail */}
                  {salaryDetail.showEarnings.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Chi tiết Thu nhập từ Shows</h5>
                      <div className="space-y-2">
                        {salaryDetail.showEarnings.map((earning, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                            <div>
                              <p className="font-medium text-sm">{earning.showName}</p>
                              <p className="text-xs text-muted-foreground">{earning.role} • {earning.date}</p>
                            </div>
                            <span className="font-bold text-green-600">{formatCurrency(earning.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Costs Detail */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">Chi tiết Cộng Thêm</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddCostForm(!showAddCostForm)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm
                      </Button>
                    </div>
                    
                    {/* Add Cost Form */}
                    {showAddCostForm && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-2 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Input
                              placeholder="Loại cộng thêm"
                              value={newCost.type}
                              onChange={(e) => setNewCost({...newCost, type: e.target.value})}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Số tiền"
                              value={newCost.amount || ''}
                              onChange={(e) => setNewCost({...newCost, amount: parseInt(e.target.value) || 0})}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Mô tả"
                              value={newCost.description}
                              onChange={(e) => setNewCost({...newCost, description: e.target.value})}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAddCost}
                            className="h-6 text-xs"
                          >
                            Lưu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddCostForm(false);
                              setNewCost({ type: '', amount: 0, description: '' });
                            }}
                            className="h-6 text-xs"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Existing Costs */}
                    {salaryDetail.additionalCosts.length > 0 && (
                      <div className="space-y-2">
                        {salaryDetail.additionalCosts.map((cost, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{cost.type}</p>
                              <p className="text-xs text-muted-foreground">{cost.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600">+{formatCurrency(cost.amount)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCost(selectedStaffForSalary, index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state for costs */}
                    {salaryDetail.additionalCosts.length === 0 && !showAddCostForm && (
                      <div className="text-center py-3 text-muted-foreground text-xs">
                        <p>Chưa có khoản cộng thêm nào</p>
                      </div>
                    )}
                  </div>

                  {/* Advances Detail */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">Chi tiết Trừ Bớt</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddAdvanceForm(!showAddAdvanceForm)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Thêm
                      </Button>
                    </div>
                    
                    {/* Add Advance Form */}
                    {showAddAdvanceForm && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-2 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <Input
                              placeholder="Loại trừ bớt"
                              value={newAdvance.type}
                              onChange={(e) => setNewAdvance({...newAdvance, type: e.target.value})}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Số tiền"
                              value={newAdvance.amount || ''}
                              onChange={(e) => setNewAdvance({...newAdvance, amount: parseInt(e.target.value) || 0})}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Mô tả"
                              value={newAdvance.description}
                              onChange={(e) => setNewAdvance({...newAdvance, description: e.target.value})}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleAddAdvance}
                            className="h-6 text-xs"
                          >
                            Lưu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowAddAdvanceForm(false);
                              setNewAdvance({ type: '', amount: 0, description: '' });
                            }}
                            className="h-6 text-xs"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Existing Advances */}
                    {salaryDetail.advances.length > 0 && (
                      <div className="space-y-2">
                        {salaryDetail.advances.map((advance, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{advance.type}</p>
                              <p className="text-xs text-muted-foreground">{advance.description}</p>
                              {advance.wishlistId && (
                                <p className="text-xs text-blue-600">→ Wishlist ID: {advance.wishlistId}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-red-600">-{formatCurrency(advance.amount)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAdvance(selectedStaffForSalary, index)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state for advances */}
                    {salaryDetail.advances.length === 0 && !showAddAdvanceForm && (
                      <div className="text-center py-3 text-muted-foreground text-xs">
                        <p>Chưa có khoản trừ bớt nào</p>
                      </div>
                    )}
                  </div>

                  {/* No additional earnings message */}
                  {salaryDetail.showEarnings.length === 0 && salaryDetail.additionalCosts.length === 0 && salaryDetail.advances.length === 0 && !showAddCostForm && !showAddAdvanceForm && (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>Không có dữ liệu lương trong tháng này</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
