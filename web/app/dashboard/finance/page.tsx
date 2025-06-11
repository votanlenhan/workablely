'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  ChevronRight,
  Clock
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
  const [staffPaymentDates, setStaffPaymentDates] = useState<{[key: string]: string}>({});
  
  // Month closing status
  const [monthClosingStatus, setMonthClosingStatus] = useState<{[key: string]: boolean}>({});
  const [closingDate, setClosingDate] = useState<string>('');

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
      status: 'Đã chi',
      date: '2025-01-10',
      notes: 'Cần để nâng cấp chất lượng ảnh'
    },
    {
      id: 2,
      item: 'Lens 24-70mm f/2.8',
      category: 'Thiết bị',
      priority: 'Trung bình',
      estimatedCost: 45000000,
      status: 'Chưa chi',
      date: '2025-01-15',
      notes: 'Thay thế lens cũ bị hỏng'
    },
    {
      id: 3,
      item: 'Đèn studio LED mới',
      category: 'Thiết bị',
      priority: 'Thấp',
      estimatedCost: 15000000,
      status: 'Chưa chi',
      date: '2025-01-20',
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
    date: new Date().toISOString().split('T')[0],
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
      recordedBy: 'Admin',
      status: 'Đã thu'
    },
    {
      id: 2,
      source: 'Cho thuê studio',
      amount: 8000000,
      date: `${year}-01-20`,
      category: 'Cho thuê',
      description: 'Thuê studio 2 ngày cho công ty ABC',
      recordedBy: 'Admin',
      status: 'Đã thu'
    },
    {
      id: 3,
      source: 'Workshop nhiếp ảnh',
      amount: 12000000,
      date: `${year}-01-25`,
      category: 'Đào tạo',
      description: 'Workshop cơ bản về nhiếp ảnh cưới',
      recordedBy: 'Manager',
      status: 'Chưa thu'
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
    recordedBy: 'Admin',
    status: 'Chưa thu'
  });

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [selectedWishlist, setSelectedWishlist] = useState<any>(null);
  const [selectedIncome, setSelectedIncome] = useState<any>(null);

  // Budget overview data - Calculated based on actual payment status
  const budgetOverview = {
    totalBudget: 200000000,
    // Fixed expenses: only count actually paid items
    fixedExpensesTotal: fixedExpenses.reduce((sum, exp) => 
      exp.status === 'Đã chi' ? sum + exp.actual : sum, 0
    ),
    // Planned fixed expenses (for forecasting)
    fixedExpensesPlanned: fixedExpenses.reduce((sum, exp) => sum + exp.actual, 0),
    wishlistBudget: 80000000,
    // Wishlist: only count actually paid items
    wishlistUsed: wishlistItems.reduce((sum, item) => 
      item.status === 'Đã chi' ? sum + item.estimatedCost : sum, 0
    ),
    // Planned wishlist expenses (for forecasting)
    wishlistPlanned: wishlistItems.reduce((sum, item) => 
      item.status === 'Đã duyệt' || item.status === 'Đã chi' ? sum + item.estimatedCost : sum, 0
    ),
    // External income: only count actually received items
    externalIncome: externalIncomes.reduce((sum, income) => 
      income.status === 'Đã thu' ? sum + income.amount : sum, 0
    ),
    // Planned external income (for forecasting)
    externalIncomePlanned: externalIncomes.reduce((sum, income) => sum + income.amount, 0)
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

  // Toggle payment status directly in table
  const handleToggleExpenseStatus = (id: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking switch
    const newStatus = currentStatus === 'Đã chi' ? 'Chưa chi' : 'Đã chi';
    setFixedExpenses(fixedExpenses.map(exp => 
      exp.id === id ? { ...exp, status: newStatus } : exp
    ));
  };

  // Toggle wishlist payment status directly in table
  const handleToggleWishlistStatus = (id: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking switch
    const newStatus = currentStatus === 'Đã chi' ? 'Chưa chi' : 'Đã chi';
    setWishlistItems(wishlistItems.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  // Toggle income status directly in table
  const handleToggleIncomeStatus = (id: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking switch
    const newStatus = currentStatus === 'Đã thu' ? 'Chưa thu' : 'Đã thu';
    setExternalIncomes(externalIncomes.map(income => 
      income.id === id ? { ...income, status: newStatus } : income
    ));
  };

  // Toggle salary payment status directly in table
  const handleToggleSalaryStatus = (staffId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking switch
    const isCurrentlyPaid = staffPaymentStatus[staffId];
    
    setStaffPaymentStatus(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));

    // Set payment date when marking as paid, clear when marking as unpaid
    setStaffPaymentDates(prev => ({
      ...prev,
      [staffId]: !isCurrentlyPaid ? new Date().toISOString().split('T')[0] : ''
    }));
  };

  // Toggle month closing status and update cash flow
  const handleToggleMonthClosing = (e: React.MouseEvent) => {
    e.stopPropagation();
    const monthKey = `${currentYear}-${selectedMonth.toString().padStart(2, '0')}`;
    const isCurrentlyClosed = monthClosingStatus[monthKey];
    
    if (!isCurrentlyClosed) {
      // Calculate final profit using new formula: Đã thu - Chi lương - Khoản tiền ngắt cho wishlist (20% doanh thu)
      const collectedRevenue = 95000000; // Actually collected
      const actualPaidSalaries = filteredStaff.reduce((total, staff) => {
        if (staffPaymentStatus[staff.id]) {
          const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
          return total + salaryDetail.totalSalary;
        }
        return total;
      }, 0);
      const actualCollectedIncome = filteredIncomes.reduce((total, income) => {
        if (income.status === 'Đã thu') {
          return total + income.amount;
        }
        return total;
      }, 0);
      const showsRevenue = 120000000;
      const wishlistReserve = showsRevenue * 0.2; // 20% doanh thu
      
      const totalIncome = collectedRevenue + actualCollectedIncome;
      const finalProfit = totalIncome - actualPaidSalaries - wishlistReserve;
      
      // Confirm before closing month
      if (confirm(`Bạn có chắc chắn muốn chốt sổ tháng này?\n\nLợi nhuận cuối cùng: ${formatCurrency(finalProfit)}\n\nHành động này sẽ cập nhật vào dòng tiền và không thể hoàn tác dễ dàng.`)) {
        setMonthClosingStatus(prev => ({
          ...prev,
          [monthKey]: true
        }));
        setClosingDate(new Date().toISOString().split('T')[0]);
        
        // Update cash flow when closing month
        console.log('Cập nhật dòng tiền:', {
          month: monthKey,
          finalProfit: finalProfit,
          totalIncome: totalIncome,
          totalExpenses: actualPaidSalaries + wishlistReserve,
          breakdown: {
            collectedRevenue: collectedRevenue,
            externalIncome: budgetOverview.externalIncome,
            salariesPaid: actualPaidSalaries,
            wishlistReserve: wishlistReserve
          }
        });
      }
    } else {
      // Confirm before reopening month
      if (confirm('Bạn có chắc chắn muốn mở lại tháng đã chốt sổ? Điều này có thể ảnh hưởng đến báo cáo và dòng tiền.')) {
        setMonthClosingStatus(prev => ({
          ...prev,
          [monthKey]: false
        }));
        setClosingDate('');
        
        // Revert cash flow when reopening month
        console.log('Hoàn tác cập nhật dòng tiền cho tháng:', monthKey);
      }
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
        recordedBy: 'Admin',
        status: 'Chưa thu'
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
        recordedBy: 'Admin',
        status: 'Chưa thu'
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
    { id: 'budget', label: 'Chi phí cố định', icon: Calculator },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-2">
        <Card>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Doanh thu</p>
                <p className="text-base font-bold text-green-600">{formatCurrency((() => {
                  const showsRevenue = 120000000; // Total shows revenue
                  return showsRevenue;
                })())}</p>
                <p className="text-xs text-green-600">Tổng doanh thu shows</p>
              </div>
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Đã thu</p>
                <p className="text-base font-bold text-green-600">{formatCurrency((() => {
                  const collectedRevenue = 95000000; // Actually collected from shows
                  return collectedRevenue + budgetOverview.externalIncome;
                })())}</p>
                <p className="text-xs text-green-600">Shows + Thu ngoài</p>
              </div>
              <ArrowUpCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

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
                <p className="text-base font-bold">{formatCurrency((() => {
                  // Calculate actual paid fixed expenses
                  const actualPaidExpenses = filteredExpenses.reduce((total, expense) => {
                    if (expense.status === 'Đã chi') {
                      return total + expense.actual;
                    }
                    return total;
                  }, 0);
                  return actualPaidExpenses;
                })())}</p>
                <p className="text-xs text-orange-600">Đã chi thực tế</p>
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
                <p className="text-base font-bold">{formatCurrency((() => {
                  // Calculate actual wishlist spending based on paid status
                  const actualWishlistSpent = filteredWishlist.reduce((total, item) => {
                    if (item.status === 'Đã chi') {
                      return total + item.estimatedCost;
                    }
                    return total;
                  }, 0);
                  return budgetOverview.wishlistBudget - actualWishlistSpent;
                })())}</p>
                <p className="text-xs text-green-600">Khả dụng thực tế</p>
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
                <p className="text-base font-bold">{formatCurrency((() => {
                  // Calculate actual collected external income
                  const actualCollectedIncome = filteredIncomes.reduce((total, income) => {
                    if (income.status === 'Đã thu') {
                      return total + income.amount;
                    }
                    return total;
                  }, 0);
                  return actualCollectedIncome;
                })())}</p>
                <p className="text-xs text-green-600">Đã thu thực tế</p>
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
                  // Calculate based on actual collected/paid amounts
                  const startingCash = 50000000;
                  const collectedRevenue = 95000000;
                  const actualCollectedIncome = filteredIncomes.reduce((total, income) => {
                    if (income.status === 'Đã thu') {
                      return total + income.amount;
                    }
                    return total;
                  }, 0);
                  const actualPaidSalaries = filteredStaff.reduce((total, staff) => {
                    if (staffPaymentStatus[staff.id]) {
                      const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                      return total + salaryDetail.totalSalary;
                    }
                    return total;
                  }, 0);
                  const actualPaidExpenses = filteredExpenses.reduce((total, expense) => {
                    if (expense.status === 'Đã chi') {
                      return total + expense.actual;
                    }
                    return total;
                  }, 0);
                  const actualWishlistSpent = filteredWishlist.reduce((total, item) => {
                    if (item.status === 'Đã chi') {
                      return total + item.estimatedCost;
                    }
                    return total;
                  }, 0);
                  
                  return startingCash + collectedRevenue + actualCollectedIncome - actualPaidSalaries - actualPaidExpenses - actualWishlistSpent;
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
                  // Calculate estimated end-of-period cash if all items are paid/collected
                  const startingCash = 50000000;
                  const totalShowsRevenue = 120000000; // Full revenue if all collected
                  const totalExternalIncome = filteredIncomes.reduce((total, income) => {
                    return total + income.amount;
                  }, 0);
                  const totalSalaries = filteredStaff.reduce((sum, staff) => {
                    const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                    return sum + salaryDetail.totalSalary;
                  }, 0);
                  const totalFixedExpenses = filteredExpenses.reduce((total, expense) => {
                    return total + expense.actual;
                  }, 0);
                  const totalWishlistBudget = filteredWishlist.reduce((total, item) => {
                    return total + item.estimatedCost;
                  }, 0);
                  
                  return startingCash + totalShowsRevenue + totalExternalIncome - totalSalaries - totalFixedExpenses - totalWishlistBudget;
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
                  <div>Ngày chi</div>
                  <div>Mô tả</div>
                  <div>Danh mục</div>
                  <div>Dự báo</div>
                  <div>Thực tế</div>
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
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                            <span>{expense.date ? new Date(expense.date).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="truncate">{expense.description || '-'}</span>
                        </div>
                        <div className="flex items-center">
                          <Icon className="h-3 w-3 mr-1" />
                          <span>{expense.category}</span>
                        </div>
                        <div className="font-medium text-blue-600">{formatCurrency(expense.predicted)}</div>
                        <div>
                          <span className="font-medium text-green-600">{formatCurrency(expense.actual)}</span>
                        </div>
                        <div className={`${getVarianceColor(expense.predicted, expense.actual)}`}>
                          {expense.actual - expense.predicted > 0 ? '+' : ''}
                          {formatCurrency(expense.actual - expense.predicted)}
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2" onClick={(e) => handleToggleExpenseStatus(expense.id, expense.status, e)}>
                            <Switch
                              checked={expense.status === 'Đã chi'}
                              className="data-[state=checked]:bg-green-600 scale-90"
                            />
                            <span className={`text-xs font-medium ${expense.status === 'Đã chi' ? 'text-green-600' : 'text-orange-600'}`}>
                              {expense.status === 'Đã chi' ? 'Đã chi' : 'Chưa chi'}
                            </span>
                          </div>
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
                          <div className="flex items-center gap-2" onClick={(e) => handleToggleExpenseStatus(expense.id, expense.status, e)}>
                            <Switch
                              checked={expense.status === 'Đã chi'}
                              className="data-[state=checked]:bg-green-600 scale-75"
                            />
                            <span className={`text-xs font-medium ${expense.status === 'Đã chi' ? 'text-green-600' : 'text-orange-600'}`}>
                              {expense.status === 'Đã chi' ? 'Đã chi' : 'Chưa chi'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mobile-finance-details">
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
                      placeholder="Tìm kiếm theo item, danh mục..."
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
                  <div className="wishlist-table-grid-simple text-xs font-medium text-muted-foreground border-b pb-1">
                  <div>Ngày Chi</div>
                  <div>Mô tả</div>
                  <div>Danh mục</div>
                  <div>Chi phí</div>
                </div>



                {/* Wishlist Rows */}
                {filteredWishlist.map((item) => {
                  return (
                    <div key={item.id}>
                      {/* Desktop Table Layout */}
                      <div 
                        className="wishlist-table-grid-simple py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => openWishlistModal('edit', item)}
                      >
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-muted-foreground mr-1" />
                            <span>{item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="truncate">{item.item || '-'}</span>
                        </div>
                        <div>
                          {item.category}
                        </div>
                        <div>
                          {formatCurrency(item.estimatedCost)}
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
                        </div>
                        
                        <div className="mobile-finance-details">
                          <div>
                            <span className="text-muted-foreground">Ngày Chi:</span>
                            <span className="font-medium">{item.date ? new Date(item.date).toLocaleDateString('vi-VN') : '-'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chi phí:</span>
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
                  <div className="income-table-grid-simple text-xs font-medium text-muted-foreground border-b pb-1">
                    <div>Ngày Thu</div>
                    <div>Mô tả</div>
                    <div>Danh mục</div>
                    <div>Số tiền</div>
                  </div>



                {/* Income Rows */}
                {filteredIncomes
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((income) => {
                  return (
                    <div key={income.id}>
                      {/* Desktop Table Layout */}
                      <div 
                        className="income-table-grid-simple py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => openIncomeModal('edit', income)}
                      >
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(income.date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-muted-foreground">
                          <div>
                            <div className="font-medium">{income.source}</div>
                            <div className="text-muted-foreground text-xs">{income.description}</div>
                          </div>
                        </div>
                        <div>
                          <span className="px-1 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs">
                            {income.category}
                          </span>
                        </div>
                        <div className="font-bold text-green-600">
                          {formatCurrency(income.amount)}
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


        </div>
      )}

      {/* Salary Tab */}
      {activeTab === 'salary' && (
        <div className="space-y-3">




          {/* Staff Salary Management */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Chi Lương Nhân viên</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm nhân viên..."
                    value={salarySearchTerm}
                    onChange={(e) => setSalarySearchTerm(e.target.value)}
                    className="h-8 text-sm pl-7"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Lọc
                </Button>
              </div>
              <div className="admin-table-container">
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="salary-table-grid text-xs font-medium text-muted-foreground border-b pb-1">
                    <div>Ngày Chi</div>
                    <div>Tên NV</div>
                    <div>Chức trách</div>
                    <div>Shows</div>
                    <div>Cộng thêm</div>
                    <div>Trừ bớt</div>
                    <div>Tổng lương</div>
                    <div>Trạng thái</div>
                  </div>

                  {/* Staff Salary Rows */}
                  {filteredStaff.map((staff) => {
                    const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                    return (
                      <div key={staff.id}>
                        {/* Desktop Table Layout */}
                        <div 
                          className="salary-table-grid py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                          onClick={() => openSalaryDetailModal(staff.id)}
                        >
                          <div className="text-xs text-muted-foreground">
                            {staffPaymentDates[staff.id] ? new Date(staffPaymentDates[staff.id]).toLocaleDateString('vi-VN') : '-'}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                              {staff.avatar}
                            </div>
                            <span className="font-medium">{staff.name}</span>
                          </div>
                          <div className="text-muted-foreground">
                            <div className="font-medium">{staff.role}</div>
                            <div className="text-xs text-muted-foreground">{staff.department}</div>
                          </div>
                          <div className="font-medium text-blue-600">{formatCurrency(salaryDetail.totalShowEarnings)}</div>
                          <div className="font-medium text-green-600">{formatCurrency(salaryDetail.totalAdditionalCosts)}</div>
                          <div className="font-medium text-red-600">{formatCurrency(salaryDetail.totalAdvances)}</div>
                          <div className="font-bold text-primary">{formatCurrency(salaryDetail.totalSalary)}</div>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center gap-2" onClick={(e) => handleToggleSalaryStatus(staff.id, e)}>
                              <Switch
                                checked={staffPaymentStatus[staff.id] || false}
                                className="data-[state=checked]:bg-green-600 scale-90"
                              />
                              <span className={`text-xs font-medium ${staffPaymentStatus[staff.id] ? 'text-green-600' : 'text-orange-600'}`}>
                                {staffPaymentStatus[staff.id] ? 'Đã chi' : 'Chưa chi'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Card Layout */}
                        <div 
                          className="mobile-finance-card cursor-pointer"
                          onClick={() => openSalaryDetailModal(staff.id)}
                        >
                          <div className="mobile-finance-header">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                                {staff.avatar}
                              </div>
                              <div>
                                <h3 className="font-medium text-sm">{staff.name}</h3>
                                <p className="text-xs text-muted-foreground">{staff.role} • {staff.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => handleToggleSalaryStatus(staff.id, e)}>
                              <Switch
                                checked={staffPaymentStatus[staff.id] || false}
                                className="data-[state=checked]:bg-green-600 scale-75"
                              />
                              <span className={`text-xs font-medium ${staffPaymentStatus[staff.id] ? 'text-green-600' : 'text-orange-600'}`}>
                                {staffPaymentStatus[staff.id] ? 'Đã chi' : 'Chưa chi'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mobile-finance-details">
                            <div>
                              <span className="text-muted-foreground">Ngày Chi:</span>
                              <span className="font-medium">{staffPaymentDates[staff.id] ? new Date(staffPaymentDates[staff.id]).toLocaleDateString('vi-VN') : 'Chưa chi'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Shows:</span>
                              <span className="font-medium text-blue-600">{formatCurrency(salaryDetail.totalShowEarnings)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cộng thêm:</span>
                              <span className="font-medium text-green-600">{formatCurrency(salaryDetail.totalAdditionalCosts)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Trừ bớt:</span>
                              <span className="font-medium text-red-600">{formatCurrency(salaryDetail.totalAdvances)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tổng lương:</span>
                              <span className="font-bold text-primary">{formatCurrency(salaryDetail.totalSalary)}</span>
                            </div>
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



      {/* Closing Tab */}
      {activeTab === 'closing' && (
        <div className="space-y-3">
          {(() => {
            const monthKey = `${currentYear}-${selectedMonth.toString().padStart(2, '0')}`;
            const isMonthClosed = monthClosingStatus[monthKey];
            
            // Calculate totals
            const actualPaidSalaries = filteredStaff.reduce((total, staff) => {
              if (staffPaymentStatus[staff.id]) {
                const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
                return total + salaryDetail.totalSalary;
              }
              return total;
            }, 0);
            
            const plannedSalaries = filteredStaff.reduce((total, staff) => {
              const salaryDetail = getStaffSalaryDetails(staff.id, currentYear, selectedMonth);
              return total + salaryDetail.totalSalary;
            }, 0);
            
            const showsRevenue = 120000000; // From shows data
            const collectedRevenue = 95000000; // Actually collected
            
            return (
              <>
                {/* Pre-Closing Checklist */}
                {!isMonthClosed && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Checklist trước khi chốt sổ</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        {(() => {
                          // Calculate amounts for each category - sync with budget overview logic
                          const collectedRevenue = 95000000;
                          const actualCollectedIncome = filteredIncomes.reduce((total, income) => {
                            if (income.status === 'Đã thu') {
                              return total + income.amount;
                            }
                            return total;
                          }, 0);
                          const wishlistReserve = showsRevenue * 0.2; // 20% doanh thu
                          
                          const checkItems = [
                            { 
                              title: 'Đã thu trong tháng', 
                              completed: true, // Always true as this is collected revenue
                              amount: collectedRevenue + actualCollectedIncome,
                              type: 'income',
                              description: `Doanh thu shows: ${formatCurrency(collectedRevenue)} + Thu ngoài: ${formatCurrency(actualCollectedIncome)}`
                            },
                            { 
                              title: 'Chi lương nhân viên', 
                              completed: filteredStaff.every(staff => staffPaymentStatus[staff.id]),
                              amount: actualPaidSalaries,
                              type: 'expense',
                              total: filteredStaff.length,
                              paid: filteredStaff.filter(staff => staffPaymentStatus[staff.id]).length
                            },
                            { 
                              title: 'Trích vào wishlist', 
                              completed: true, // Always reserve this amount
                              amount: wishlistReserve,
                              type: 'reserve',
                              description: `20% của ${formatCurrency(showsRevenue)}`
                            }
                          ];

                          return checkItems.map((check, index) => (
                            <div key={index} className="p-3 rounded border bg-muted/20">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                    check.completed ? 'bg-green-600' : 'bg-orange-500'
                                  }`}>
                                    {check.completed ? 
                                      <span className="text-white text-xs">✓</span> : 
                                      <span className="text-white text-xs">!</span>
                                    }
                                  </div>
                                  <span className="text-sm font-medium">{check.title}</span>
                                </div>
                                {check.total && (
                                  <span className="text-xs text-muted-foreground">
                                    {check.paid}/{check.total} hoàn thành
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {check.description || ''}
                                </div>
                                <div className={`font-bold text-sm ${
                                  check.type === 'income' ? 'text-green-600' : 
                                  check.type === 'expense' ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                  {check.type === 'income' ? '+' : '-'}{formatCurrency(check.amount)}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}

                        {/* Final Profit Calculation */}
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-base">Lợi nhuận cuối cùng:</span>
                            <span className={`font-bold text-lg ${
                              (() => {
                                const actualCollectedIncomeForProfit = filteredIncomes.reduce((total, income) => {
                                  if (income.status === 'Đã thu') {
                                    return total + income.amount;
                                  }
                                  return total;
                                }, 0);
                                const totalIncome = collectedRevenue + actualCollectedIncomeForProfit;
                                const totalExpenses = actualPaidSalaries + (showsRevenue * 0.2);
                                return totalIncome - totalExpenses > 0 ? 'text-green-600' : 'text-red-600';
                              })()
                            }`}>
                              {(() => {
                                const actualCollectedIncomeForProfit = filteredIncomes.reduce((total, income) => {
                                  if (income.status === 'Đã thu') {
                                    return total + income.amount;
                                  }
                                  return total;
                                }, 0);
                                const totalIncome = collectedRevenue + actualCollectedIncomeForProfit;
                                const totalExpenses = actualPaidSalaries + (showsRevenue * 0.2);
                                return formatCurrency(totalIncome - totalExpenses);
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Closing Status - Moved to bottom */}
                <Card className={`${isMonthClosed ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Chốt sổ Tháng {selectedMonth}/{currentYear}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isMonthClosed 
                            ? `Đã chốt sổ ngày ${closingDate ? new Date(closingDate).toLocaleDateString('vi-VN') : ''}`
                            : 'Tháng chưa được chốt sổ'
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2" onClick={handleToggleMonthClosing}>
                          <Switch
                            checked={isMonthClosed}
                            className={`data-[state=checked]:bg-green-600 ${isMonthClosed ? 'scale-110' : 'scale-100'}`}
                          />
                          <span className={`text-sm font-medium ${isMonthClosed ? 'text-green-600' : 'text-orange-600'}`}>
                            {isMonthClosed ? 'Đã chốt sổ' : 'Chưa chốt sổ'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </>
            );
          })()}
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

                    <option value="Bảo trì">Bảo trì</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="predicted" className="text-sm font-medium text-foreground">
                      Dự báo
                      {modalMode === 'edit' && (
                        <span className="text-xs text-muted-foreground ml-1">(từ tháng trước)</span>
                      )}
                    </Label>
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
                      className={`mt-1 bg-background border-input h-9 ${modalMode === 'edit' ? 'opacity-60' : ''}`}
                      readOnly={modalMode === 'edit'}
                      disabled={modalMode === 'edit'}
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
                  <Label htmlFor="status" className="text-sm font-medium text-foreground">Trạng thái thanh toán</Label>
                  <div className="flex items-center justify-between mt-2 p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${
                        (modalMode === 'edit' ? selectedExpense?.status === 'Đã chi' : newExpense.status === 'Đã chi') 
                          ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {(modalMode === 'edit' ? selectedExpense?.status === 'Đã chi' : newExpense.status === 'Đã chi') 
                          ? 'Đã chi' : 'Chưa chi'}
                      </span>
                      <Switch
                        id="status"
                        checked={modalMode === 'edit' ? selectedExpense?.status === 'Đã chi' : newExpense.status === 'Đã chi'}
                        onCheckedChange={(checked) => {
                          const newStatus = checked ? 'Đã chi' : 'Chưa chi';
                          if (modalMode === 'edit' && selectedExpense) {
                            setSelectedExpense({...selectedExpense, status: newStatus});
                          } else {
                            setNewExpense({...newExpense, status: newStatus});
                          }
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(modalMode === 'edit' ? selectedExpense?.status === 'Đã chi' : newExpense.status === 'Đã chi') 
                        ? '✅ Đã tác động vào dòng tiền' 
                        : '⏳ Chưa tác động vào dòng tiền'}
                    </div>
                  </div>
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
                  <Label htmlFor="item" className="text-sm font-medium text-foreground">Mô tả</Label>
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
                    <Label htmlFor="wishlist-date" className="text-sm font-medium text-foreground">Ngày</Label>
                    <Input
                      id="wishlist-date"
                      type="date"
                      value={modalMode === 'edit' ? selectedWishlist?.date || new Date().toISOString().split('T')[0] : (newWishlistItem.date || new Date().toISOString().split('T')[0])}
                      onChange={(e) => {
                        if (modalMode === 'edit' && selectedWishlist) {
                          setSelectedWishlist({...selectedWishlist, date: e.target.value});
                        } else {
                          setNewWishlistItem({...newWishlistItem, date: e.target.value});
                        }
                      }}
                      className="mt-1 bg-background border-input h-9"
                    />
                  </div>
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
                </div>

                <div>
                  <Label htmlFor="estimatedCost" className="text-sm font-medium text-foreground">Số tiền</Label>
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
                </div>

                <div>
                  <Label htmlFor="source" className="text-sm font-medium text-foreground">Mô tả</Label>
                  <Input
                    id="source"
                    placeholder="Mô tả nguồn thu"
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
