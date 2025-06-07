'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Calendar,
  DollarSign,
  Save,
  X,
  CalendarDays,
  Kanban,
  History,
  Receipt,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { DatePickerInput } from '@/components/ui/date-picker';

interface Payment {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'installment' | 'final';
  description?: string;
  recordedBy: string;
  recordedAt: string;
}

interface AuditLog {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  description: string;
}

interface Show {
  id: string;
  shootDate: string;
  deliveryDate: string;
  shootTime: string;
  customer: string;
  phone: string;
  price: number;
  deposit: number;
  paid: number;
  type: string;
  key: string;
  support1: string;
  support2: string;
  selective: string;
  blend: string;
  retouch: string;
  status: 'Chờ tới ngày chụp' | 'Chờ design' | 'Đang design' | 'Hoàn thành';
  designStatus: 'Not Started' | 'Waiting' | 'Blend: Work in Progress' | 'Retouch: Work in Progress' | 'Video: Work in Progress' | 'Done/Archived';
  payments: Payment[];
  auditLogs: AuditLog[];
  totalCollected: number;
  amountDue: number;
  paymentStatus: 'Chưa thanh toán' | 'Còn nợ' | 'Đã thanh toán đủ';
}

const showsData: Show[] = [
  {
    id: 'SH001',
    shootDate: '2025-01-05',
    deliveryDate: '2025-01-20',
    shootTime: 'Sáng',
    customer: 'TT Gia Nghĩa',
    phone: '',
    price: 1750000,
    deposit: 1000000,
    paid: 1750000,
    type: 'Chụp TT',
    key: 'Đạt',
    support1: 'Đạt',
    support2: '',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Hoàn thành',
    designStatus: 'Done/Archived',
    payments: [
      {
        id: 'p1',
        amount: 1000000,
        date: '2024-12-20',
        type: 'deposit',
        description: 'Tiền cọc đặt lịch',
        recordedBy: 'Admin',
        recordedAt: '2024-12-20T10:30:00Z'
      },
      {
        id: 'p2',
        amount: 750000,
        date: '2025-01-05',
        type: 'final',
        description: 'Thanh toán cuối khi giao hàng',
        recordedBy: 'Admin',
        recordedAt: '2025-01-05T15:45:00Z'
      }
    ],
    auditLogs: [
      {
        id: 'a1',
        field: 'status',
        oldValue: 'Chờ design',
        newValue: 'Hoàn thành',
        changedBy: 'Admin',
        changedAt: '2025-01-05T16:00:00Z',
        description: 'Cập nhật trạng thái hoàn thành'
      },
      {
        id: 'a2',
        field: 'key',
        oldValue: 'An',
        newValue: 'Đạt',
        changedBy: 'Manager',
        changedAt: '2024-12-25T09:15:00Z',
        description: 'Thay đổi photographer chính'
      }
    ],
    totalCollected: 1750000,
    amountDue: 0,
    paymentStatus: 'Đã thanh toán đủ'
  },
  {
    id: 'SH002',
    shootDate: '2025-01-08',
    deliveryDate: '2025-01-24',
    shootTime: 'Cả ngày',
    customer: 'YEP Thanh Mai',
    phone: '',
    price: 2560000,
    deposit: 1000000,
    paid: 2560000,
    type: 'Event',
    key: 'Đạt',
    support1: 'An',
    support2: '',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Hoàn thành',
    designStatus: 'Done/Archived',
    payments: [],
    auditLogs: [],
    totalCollected: 2560000,
    amountDue: 0,
    paymentStatus: 'Đã thanh toán đủ'
  },
  {
    id: 'SH003',
    shootDate: '2025-01-10',
    deliveryDate: '2025-01-24',
    shootTime: 'Chiều',
    customer: 'YEP SG',
    phone: '',
    price: 4600000,
    deposit: 1500000,
    paid: 1500000,
    type: 'Event',
    key: 'Đạt',
    support1: 'Huy',
    support2: '',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Chờ design',
    designStatus: 'Blend: Work in Progress',
    payments: [
      {
        id: 'p3',
        amount: 1500000,
        date: '2025-01-08',
        type: 'deposit',
        description: 'Tiền cọc 50%',
        recordedBy: 'Manager',
        recordedAt: '2025-01-08T14:20:00Z'
      }
    ],
    auditLogs: [
      {
        id: 'a3',
        field: 'status',
        oldValue: 'Chờ tới ngày chụp',
        newValue: 'Chờ design',
        changedBy: 'Manager',
        changedAt: '2025-01-10T18:30:00Z',
        description: 'Hoàn thành buổi chụp'
      }
    ],
    totalCollected: 1500000,
    amountDue: 3100000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH004',
    shootDate: '2025-01-12',
    deliveryDate: '2025-01-12',
    customer: '12A8 THPT Cao Ba Quát',
    phone: '',
    price: 4720000,
    deposit: 1000000,
    paid: 1000000,
    type: 'Chụp K.Y',
    key: 'Huy Lớn',
    support1: 'A Phúc',
    support2: 'An',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Chờ design',
    designStatus: 'Retouch: Work in Progress',
    payments: [],
    auditLogs: [],
    totalCollected: 1000000,
    amountDue: 3720000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH005',
    shootDate: '2025-01-12',
    deliveryDate: '2025-01-21',
    customer: '12A5 Cao Nguyên (Chụp)',
    phone: '',
    price: 4830000,
    deposit: 3150000,
    paid: 1680000,
    type: 'Chụp K.Y',
    key: 'Đạt',
    support1: 'Long',
    support2: 'Lai',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Chờ design',
    designStatus: 'Blend: Work in Progress',
    payments: [],
    auditLogs: [],
    totalCollected: 1680000,
    amountDue: 3150000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH006',
    shootDate: '2025-01-18',
    deliveryDate: '2025-01-24',
    customer: '12A12 THPT Chu Văn An',
    phone: '',
    price: 6800000,
    deposit: 3500000,
    paid: 3300000,
    type: 'Chụp K.Y',
    key: 'Đạt',
    support1: 'A Phúc',
    support2: 'Thế Anh',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Chờ tới ngày chụp',
    designStatus: 'Not Started',
    payments: [],
    auditLogs: [],
    totalCollected: 3300000,
    amountDue: 3500000,
    paymentStatus: 'Còn nợ'
  }
];

// Calendar Component
function CalendarView({ shows }: { shows: Show[] }) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
  
  const getShowsForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shows.filter(show => show.shootDate === dateStr);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Lịch Shows - Tháng {currentMonth + 1}/{currentYear}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* Header */}
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Empty days */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="p-2 h-20"></div>
          ))}
          
          {/* Days with shows */}
          {days.map(day => {
            const dayShows = getShowsForDate(day);
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            
            return (
              <div key={day} className={`p-1 h-20 border rounded text-xs ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className={`font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayShows.slice(0, 2).map(show => (
                    <div key={show.id} className="p-1 bg-green-100 dark:bg-green-900/30 rounded text-xs truncate">
                      {show.customer}
                    </div>
                  ))}
                  {dayShows.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayShows.length - 2} khác</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Design Board Component
function DesignBoard({ shows, onUpdateShow }: { shows: Show[], onUpdateShow: (id: string, updates: Partial<Show>) => void }) {
  const stages = [
    { id: 'Not Started', title: 'Chưa bắt đầu', color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'Waiting', title: 'Chờ xử lý', color: 'bg-red-100 dark:bg-red-900/30' },
    { id: 'Blend: Work in Progress', title: 'Blend: Đang xử lý', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { id: 'Retouch: Work in Progress', title: 'Retouch: Đang xử lý', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { id: 'Video: Work in Progress', title: 'Video: Đang xử lý', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { id: 'Done/Archived', title: 'Hoàn thành', color: 'bg-green-100 dark:bg-green-900/30' }
  ];
  
  const getShowsForStage = (stageId: string) => {
    return shows.filter(show => show.designStatus === stageId);
  };
  
  const handleDragStart = (e: React.DragEvent, showId: string) => {
    e.dataTransfer.setData('text/plain', showId);
  };
  
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const showId = e.dataTransfer.getData('text/plain');
    onUpdateShow(showId, { designStatus: stageId as Show['designStatus'] });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          Bảng Tiến trình Design
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid grid-cols-6 gap-2">
          {stages.map(stage => (
            <div 
              key={stage.id}
              className={`p-2 rounded-lg min-h-[400px] ${stage.color}`}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
            >
              <h3 className="font-medium text-xs mb-2 text-center">{stage.title}</h3>
              <div className="space-y-2">
                {getShowsForStage(stage.id).map(show => (
                  <div
                    key={show.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, show.id)}
                    className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-xs truncate">{show.customer}</div>
                    <div className="text-xs text-muted-foreground">{show.type}</div>
                    <div className="text-xs text-muted-foreground">
                      Key: {show.key || '-'}
                    </div>
                    <div className="text-xs text-blue-600">
                      Giao: {new Date(show.deliveryDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>(showsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [newShow, setNewShow] = useState({
    shootDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    shootTime: '',
    customer: '',
    phone: '',
    price: 0,
    deposit: 0,
    paid: 0,
    type: 'Chụp TT',
    key: '',
    support1: '',
    support2: '',
    selective: '',
    blend: '',
    retouch: ''
  });

  // Payment form state
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'installment' as Payment['type'],
    description: ''
  });

  // Payment editing state
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Auto-update status based on shoot date
  useEffect(() => {
    const updateStatuses = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setShows(prevShows => 
        prevShows.map(show => {
          const shootDate = new Date(show.shootDate);
          shootDate.setHours(0, 0, 0, 0);
          
          let newStatus = show.status;
          let newDesignStatus = show.designStatus;
          
          if (shootDate > today && show.status !== 'Hoàn thành') {
            newStatus = 'Chờ tới ngày chụp';
            newDesignStatus = 'Not Started';
          } else if (shootDate <= today && show.status === 'Chờ tới ngày chụp') {
            newStatus = 'Chờ design';
            newDesignStatus = 'Waiting';
          }
          
          return {
            ...show,
            status: newStatus,
            designStatus: newDesignStatus
          };
        })
      );
    };
    
    updateStatuses();
    // Update every hour
    const interval = setInterval(updateStatuses, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle keyboard shortcuts for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditModalOpen && event.key === 'Escape') {
        setIsEditModalOpen(false);
        setEditingShow(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditModalOpen]);

  const handleCreateShow = () => {
    if (newShow.customer && newShow.price > 0) {
      const id = `SH${String(shows.length + 1).padStart(3, '0')}`;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const shootDate = new Date(newShow.shootDate);
      shootDate.setHours(0, 0, 0, 0);
      
      const status = shootDate > today ? 'Chờ tới ngày chụp' : 'Chờ design';
      const designStatus = shootDate > today ? 'Not Started' : 'Waiting';
      
      const show: Show = {
        id,
        ...newShow,
        status: status as Show['status'],
        designStatus: designStatus as Show['designStatus'],
        payments: [],
        auditLogs: [],
        totalCollected: 0,
        amountDue: newShow.price,
        paymentStatus: 'Chưa thanh toán'
      };
      setShows([...shows, show]);
      setNewShow({
        shootDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        shootTime: '',
        customer: '',
        phone: '',
        price: 0,
        deposit: 0,
        paid: 0,
        type: 'Chụp TT',
        key: '',
        support1: '',
        support2: '',
        selective: '',
        blend: '',
        retouch: ''
      });
      setIsModalOpen(false);
    }
  };

  // Handle update show
  const handleUpdateShow = (id: string, updatedShow: Partial<Show>) => {
    setShows(shows.map(show => 
      show.id === id ? { ...show, ...updatedShow } : show
    ));
  };

  // Handle row click to edit
  const handleRowClick = (showId: string) => {
    const show = shows.find(s => s.id === showId);
    if (show) {
      setEditingShow(show);
      setIsEditModalOpen(true);
    }
  };

  // Handle edit show
  const handleEditShow = () => {
    if (editingShow) {
      // Create audit log for show info changes
      const originalShow = shows.find(s => s.id === editingShow.id);
      if (originalShow) {
        const auditLogs = [...editingShow.auditLogs];
        
        // Check for changes and create audit logs
        const fieldsToCheck = [
          { key: 'customer', label: 'Tên khách hàng' },
          { key: 'phone', label: 'Số điện thoại' },
          { key: 'price', label: 'Giá' },
          { key: 'type', label: 'Loại show' },
          { key: 'shootDate', label: 'Ngày chụp' },
          { key: 'deliveryDate', label: 'Ngày giao' },
          { key: 'shootTime', label: 'Thời gian' },
          { key: 'key', label: 'Key' },
          { key: 'support1', label: 'SP1' },
          { key: 'support2', label: 'SP2' },
          { key: 'selective', label: 'Culling' },
          { key: 'blend', label: 'Blend' },
          { key: 'retouch', label: 'Retouch' },
          { key: 'status', label: 'Trạng thái' },
          { key: 'designStatus', label: 'Trạng thái Design' }
        ];

        fieldsToCheck.forEach(field => {
          const oldValue = originalShow[field.key as keyof Show];
          const newValue = editingShow[field.key as keyof Show];
          
          if (oldValue !== newValue) {
            auditLogs.push({
              id: `a${Date.now()}_${field.key}`,
              field: field.key,
              oldValue: String(oldValue),
              newValue: String(newValue),
              changedBy: 'Admin',
              changedAt: new Date().toISOString(),
              description: `Cập nhật ${field.label}`
            });
          }
        });

        const updatedShow = { ...editingShow, auditLogs };
        setShows(shows.map(show => 
          show.id === editingShow.id ? updatedShow : show
        ));
      } else {
        setShows(shows.map(show => 
          show.id === editingShow.id ? editingShow : show
        ));
      }
      
      setIsEditModalOpen(false);
      setEditingShow(null);
    }
  };

  // Handle delete show
  const handleDeleteShow = (showId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent row click
    }
    if (confirm('Bạn có chắc chắn muốn xóa show này?')) {
      setShows(shows.filter(show => show.id !== showId));
      if (editingShow && editingShow.id === showId) {
        setEditingShow(null);
        setIsEditModalOpen(false);
      }
    }
  };

  // Handle add payment
  const handleAddPayment = () => {
    if (!editingShow || newPayment.amount <= 0) return;

    const payment: Payment = {
      id: `p${Date.now()}`,
      amount: newPayment.amount,
      date: newPayment.date,
      type: newPayment.type,
      description: newPayment.description || `Thanh toán ${newPayment.type === 'deposit' ? 'cọc' : newPayment.type === 'installment' ? 'đợt' : 'cuối'}`,
      recordedBy: 'Admin', // In real app, get from auth context
      recordedAt: new Date().toISOString()
    };

    const updatedPayments = [...editingShow.payments, payment];
    const totalCollected = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const amountDue = editingShow.price - totalCollected;
    const paymentStatus: Show['paymentStatus'] = 
      totalCollected >= editingShow.price ? 'Đã thanh toán đủ' :
      totalCollected > 0 ? 'Còn nợ' : 'Chưa thanh toán';

    // Create audit log for payment
    const auditLog: AuditLog = {
      id: `a${Date.now()}`,
      field: 'payment',
      oldValue: `Đã thu: ${formatCurrency(editingShow.totalCollected)}₫`,
      newValue: `Đã thu: ${formatCurrency(totalCollected)}₫`,
      changedBy: 'Admin',
      changedAt: new Date().toISOString(),
      description: `Thêm thanh toán ${formatCurrency(newPayment.amount)}₫`
    };

    const updatedShow = {
      ...editingShow,
      payments: updatedPayments,
      totalCollected,
      amountDue,
      paymentStatus,
      auditLogs: [...editingShow.auditLogs, auditLog]
    };

    setEditingShow(updatedShow);
    setShows(shows.map(show => 
      show.id === editingShow.id ? updatedShow : show
    ));

    // Reset form
    setNewPayment({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'installment',
      description: ''
    });
  };

  // Handle edit payment
  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
  };

  // Handle update payment
  const handleUpdatePayment = () => {
    if (!editingShow || !editingPayment) return;

    const updatedPayments = editingShow.payments.map(p => 
      p.id === editingPayment.id ? editingPayment : p
    );
    
    const totalCollected = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const amountDue = editingShow.price - totalCollected;
    const paymentStatus: Show['paymentStatus'] = 
      totalCollected >= editingShow.price ? 'Đã thanh toán đủ' :
      totalCollected > 0 ? 'Còn nợ' : 'Chưa thanh toán';

    // Create audit log for payment update
    const auditLog: AuditLog = {
      id: `a${Date.now()}`,
      field: 'payment',
      oldValue: `Cập nhật thanh toán`,
      newValue: `${formatCurrency(editingPayment.amount)}₫`,
      changedBy: 'Admin',
      changedAt: new Date().toISOString(),
      description: `Cập nhật thanh toán ${formatCurrency(editingPayment.amount)}₫`
    };

    const updatedShow = {
      ...editingShow,
      payments: updatedPayments,
      totalCollected,
      amountDue,
      paymentStatus,
      auditLogs: [...editingShow.auditLogs, auditLog]
    };

    setEditingShow(updatedShow);
    setShows(shows.map(show => 
      show.id === editingShow.id ? updatedShow : show
    ));

    setEditingPayment(null);
  };

  // Handle delete payment
  const handleDeletePayment = (paymentId: string) => {
    if (!editingShow) return;
    
    if (confirm('Bạn có chắc chắn muốn xóa thanh toán này?')) {
      const paymentToDelete = editingShow.payments.find(p => p.id === paymentId);
      const updatedPayments = editingShow.payments.filter(p => p.id !== paymentId);
      
      const totalCollected = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const amountDue = editingShow.price - totalCollected;
      const paymentStatus: Show['paymentStatus'] = 
        totalCollected >= editingShow.price ? 'Đã thanh toán đủ' :
        totalCollected > 0 ? 'Còn nợ' : 'Chưa thanh toán';

      // Create audit log for payment deletion
      const auditLog: AuditLog = {
        id: `a${Date.now()}`,
        field: 'payment',
        oldValue: `Xóa thanh toán`,
        newValue: `${formatCurrency(paymentToDelete?.amount || 0)}₫`,
        changedBy: 'Admin',
        changedAt: new Date().toISOString(),
        description: `Xóa thanh toán ${formatCurrency(paymentToDelete?.amount || 0)}₫`
      };

      const updatedShow = {
        ...editingShow,
        payments: updatedPayments,
        totalCollected,
        amountDue,
        paymentStatus,
        auditLogs: [...editingShow.auditLogs, auditLog]
      };

      setEditingShow(updatedShow);
      setShows(shows.map(show => 
        show.id === editingShow.id ? updatedShow : show
      ));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return <CheckCircle className="h-3 w-3" />;
      case 'Chờ design':
      case 'Đang design':
        return <Clock className="h-3 w-3" />;
      case 'Chờ tới ngày chụp':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Chờ design':
      case 'Đang design':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Chờ tới ngày chụp':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentStatus = (price: number, paid: number) => {
    if (paid >= price) return { text: 'Đã thu đủ', color: 'text-green-600' };
    if (paid > 0) return { text: 'Đã cọc', color: 'text-blue-600' };
    return { text: 'Chưa thu', color: 'text-red-600' };
  };

  // Filter shows based on search term and filters
  const filteredShows = shows.filter(show => {
    const matchesSearch = searchTerm === '' || 
      show.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.phone.includes(searchTerm) ||
      show.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.support1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.support2.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || show.status === statusFilter;
    const matchesType = typeFilter === 'all' || show.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const typeOptions = ['Chụp TT', 'Event', 'Chụp K.Y', 'Quay K.Y', 'Quay PSC', 'Chụp PSC', 'Makeup', 'Ảnh Thẻ'];
  const staffOptions = ['Đạt', 'An', 'Huy', 'Huy Lớn', 'A Phúc', 'Long', 'Lai', 'Thế Anh', 'Hoa'];
  const statusOptions: Show['status'][] = ['Chờ tới ngày chụp', 'Chờ design', 'Đang design', 'Hoàn thành'];

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Quản lý Shows
        </h2>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="h-8 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Tạo Show mới
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="text-xs">Danh sách Shows</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">Lịch</TabsTrigger>
          <TabsTrigger value="board" className="text-xs">Bảng Design</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-3">
          {/* Shows List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Danh sách Shows</CardTitle>
              <p className="text-xs text-muted-foreground">
                Click vào hàng để chỉnh sửa trong modal.
              </p>
            </CardHeader>
            <CardContent className="p-2">
              {/* Search and Filters */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo tên khách hàng, ID, SĐT, Key, SP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 text-sm pl-7"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 px-2 text-xs border border-input bg-background rounded-md"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Chờ tới ngày chụp">Chờ tới ngày chụp</option>
                  <option value="Chờ design">Chờ design</option>
                  <option value="Đang design">Đang design</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-8 px-2 text-xs border border-input bg-background rounded-md"
                >
                  <option value="all">Tất cả loại</option>
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Filter className="h-3 w-3" />
                  Lọc
                </Button>
              </div>
              
              <div className="admin-table-container">
                <div className="admin-table">
                  {/* Table Header */}
                  <div className="admin-table-header shows-table-grid">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày chụp
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày giao
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Thời gian
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Khách hàng
                  </div>
                  <div>SĐT</div>
                  <div>Giá</div>
                  <div>Loại</div>
                  <div>Key</div>
                  <div>SP1</div>
                  <div>SP2</div>
                  <div>Culling</div>
                  <div>Blend</div>
                  <div>Retouch</div>
                  <div>Trạng thái</div>
                </div>

                {/* Show Rows */}
                {filteredShows.map((show) => {
                  const paymentStatus = getPaymentStatus(show.price, show.totalCollected);
                  const remaining = show.amountDue;
                  
                  return (
                    <div key={show.id}>
                      {/* Desktop Table Layout */}
                      <div 
                        className="admin-table-row shows-table-grid cursor-pointer hover:bg-muted/30"
                        onClick={() => handleRowClick(show.id)}
                      >
                        <div className="admin-table-cell">
                          <span className="text-sm">{new Date(show.shootDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{new Date(show.deliveryDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.shootTime || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <div>
                            <div className="font-medium text-sm truncate">{show.customer}</div>
                            <div className={`text-xs ${paymentStatus.color}`}>
                              {paymentStatus.text} • Còn {formatCurrency(remaining)}
                            </div>
                          </div>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.phone || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm font-medium">{formatCurrency(show.price)}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs">
                            {show.type}
                          </span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.key || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.support1 || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.support2 || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.selective || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.blend || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className="text-sm">{show.retouch || '-'}</span>
                        </div>
                        <div className="admin-table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(show.status)}`}>
                            {getStatusIcon(show.status)}
                            {show.status}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Card Layout */}
                      <div 
                        className="mobile-show-card cursor-pointer"
                        onClick={() => handleRowClick(show.id)}
                      >
                        <div className="mobile-show-header">
                          <div>
                            <h3 className="font-medium text-sm">{show.customer}</h3>
                            <p className="text-xs text-muted-foreground">{show.type}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(show.status)}`}>
                            {getStatusIcon(show.status)}
                            {show.status}
                          </span>
                        </div>
                        
                        <div className="mobile-show-details">
                          <div>
                            <span className="text-xs text-muted-foreground">Ngày chụp:</span>
                            <p className="text-sm">{new Date(show.shootDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Thời gian:</span>
                            <p className="text-sm">{show.shootTime || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Ngày giao:</span>
                            <p className="text-sm">{new Date(show.deliveryDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Giá:</span>
                            <p className="text-sm font-medium">{formatCurrency(show.price)}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">SĐT:</span>
                            <p className="text-sm">{show.phone || '-'}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Thanh toán:</span>
                            <p className={`text-sm ${paymentStatus.color}`}>
                              {paymentStatus.text}
                            </p>
                          </div>
                        </div>

                        <div className="mobile-show-staff">
                          {show.key && (
                            <span className="mobile-staff-badge">
                              Key: {show.key}
                            </span>
                          )}
                          {show.support1 && (
                            <span className="mobile-staff-badge">
                              SP1: {show.support1}
                            </span>
                          )}
                          {show.support2 && (
                            <span className="mobile-staff-badge">
                              SP2: {show.support2}
                            </span>
                          )}
                          {show.selective && (
                            <span className="mobile-staff-badge">
                              Culling: {show.selective}
                            </span>
                          )}
                          {show.blend && (
                            <span className="mobile-staff-badge">
                              Blend: {show.blend}
                            </span>
                          )}
                          {show.retouch && (
                            <span className="mobile-staff-badge">
                              Retouch: {show.retouch}
                            </span>
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
        </TabsContent>
        
        <TabsContent value="calendar">
          <CalendarView shows={filteredShows} />
        </TabsContent>
        
        <TabsContent value="board">
          <DesignBoard shows={filteredShows} onUpdateShow={handleUpdateShow} />
        </TabsContent>
      </Tabs>

      {/* Create Show Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-background rounded-lg p-3 w-full max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tạo Show mới
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsModalOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs font-medium">Ngày chụp</Label>
                  <Input
                    type="date"
                    value={newShow.shootDate}
                    onChange={(e) => setNewShow({...newShow, shootDate: e.target.value})}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Ngày giao</Label>
                  <Input
                    type="date"
                    value={newShow.deliveryDate}
                    onChange={(e) => setNewShow({...newShow, deliveryDate: e.target.value})}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Thời gian</Label>
                  <Input
                    type="text"
                    placeholder="VD: Sáng, Chiều, Tối"
                    value={newShow.shootTime}
                    onChange={(e) => setNewShow({...newShow, shootTime: e.target.value})}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Loại show</Label>
                  <select 
                    value={newShow.type}
                    onChange={(e) => setNewShow({...newShow, type: e.target.value})}
                    className="w-full px-2 py-1 border rounded-md text-xs h-8"
                    required
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Giá (VND)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập giá"
                    value={newShow.price}
                    onChange={(e) => setNewShow({...newShow, price: Number(e.target.value)})}
                    className="h-8 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Tên khách hàng</Label>
                <Input
                  placeholder="Nhập tên khách hàng"
                  value={newShow.customer}
                  onChange={(e) => setNewShow({...newShow, customer: e.target.value})}
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs font-medium">Số điện thoại</Label>
                  <Input
                    placeholder="Nhập số điện thoại"
                    value={newShow.phone}
                    onChange={(e) => setNewShow({...newShow, phone: e.target.value})}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Tiền cọc</Label>
                  <Input
                    type="number"
                    placeholder="Nhập tiền cọc"
                    value={newShow.deposit}
                    onChange={(e) => setNewShow({...newShow, deposit: Number(e.target.value)})}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Đã thu</Label>
                  <Input
                    type="number"
                    placeholder="Nhập số tiền đã thu"
                    value={newShow.paid}
                    onChange={(e) => setNewShow({...newShow, paid: Number(e.target.value)})}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Staff Assignment */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Phân công nhân viên</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Key</Label>
                    <select 
                      value={newShow.key}
                      onChange={(e) => setNewShow({...newShow, key: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn Key</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">SP1</Label>
                    <select 
                      value={newShow.support1}
                      onChange={(e) => setNewShow({...newShow, support1: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn SP1</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">SP2</Label>
                    <select 
                      value={newShow.support2}
                      onChange={(e) => setNewShow({...newShow, support2: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn SP2</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Culling</Label>
                    <select 
                      value={newShow.selective}
                      onChange={(e) => setNewShow({...newShow, selective: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn Culling</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Blend</Label>
                    <select 
                      value={newShow.blend}
                      onChange={(e) => setNewShow({...newShow, blend: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn Blend</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Retouch</Label>
                    <select 
                      value={newShow.retouch}
                      onChange={(e) => setNewShow({...newShow, retouch: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn Retouch</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  onClick={handleCreateShow}
                  className="flex-1 h-9 text-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Tạo Show
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 text-sm sm:w-auto"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Show Modal */}
      {isEditModalOpen && editingShow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Chỉnh sửa Show - {editingShow.customer}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingShow(null);
                }}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="info" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 p-2">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Thông tin Show</span>
                  <span className="sm:hidden">Thông tin</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 p-2">
                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Lịch sử Thanh toán</span>
                  <span className="sm:hidden">Thanh toán</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 p-2">
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Lịch sử Chỉnh sửa</span>
                  <span className="sm:hidden">Lịch sử</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">Ngày chụp</Label>
                  <Input
                    type="date"
                    value={editingShow.shootDate}
                    onChange={(e) => setEditingShow({...editingShow, shootDate: e.target.value})}
                    className="h-10 text-sm bg-background border-input"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Ngày giao</Label>
                  <Input
                    type="date"
                    value={editingShow.deliveryDate}
                    onChange={(e) => setEditingShow({...editingShow, deliveryDate: e.target.value})}
                    className="h-10 text-sm bg-background border-input"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Thời gian</Label>
                  <Input
                    type="text"
                    placeholder="VD: Sáng, Chiều, Tối"
                    value={editingShow.shootTime}
                    onChange={(e) => setEditingShow({...editingShow, shootTime: e.target.value})}
                    className="h-10 text-sm bg-background border-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">Loại show</Label>
                  <select 
                    value={editingShow.type}
                    onChange={(e) => setEditingShow({...editingShow, type: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    required
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Giá (VND)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập giá"
                    value={editingShow.price}
                    onChange={(e) => setEditingShow({...editingShow, price: Number(e.target.value)})}
                    className="h-10 text-sm bg-background border-input"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Tên khách hàng</Label>
                <Input
                  placeholder="Nhập tên khách hàng"
                  value={editingShow.customer}
                  onChange={(e) => setEditingShow({...editingShow, customer: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Số điện thoại</Label>
                <Input
                  placeholder="Nhập số điện thoại"
                  value={editingShow.phone}
                  onChange={(e) => setEditingShow({...editingShow, phone: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                />
              </div>

              {/* Staff Assignment */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Phân công nhân viên</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-foreground">Key</Label>
                    <select 
                      value={editingShow.key}
                      onChange={(e) => setEditingShow({...editingShow, key: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn Key</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground">SP1</Label>
                    <select 
                      value={editingShow.support1}
                      onChange={(e) => setEditingShow({...editingShow, support1: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn SP1</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-foreground">SP2</Label>
                    <select 
                      value={editingShow.support2}
                      onChange={(e) => setEditingShow({...editingShow, support2: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn SP2</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground">Culling</Label>
                    <select 
                      value={editingShow.selective}
                      onChange={(e) => setEditingShow({...editingShow, selective: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn Culling</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-foreground">Blend</Label>
                    <select 
                      value={editingShow.blend}
                      onChange={(e) => setEditingShow({...editingShow, blend: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn Blend</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground">Retouch</Label>
                    <select 
                      value={editingShow.retouch}
                      onChange={(e) => setEditingShow({...editingShow, retouch: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn Retouch</option>
                      {staffOptions.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm text-foreground">Trạng thái</Label>
                    <select 
                      value={editingShow.status}
                      onChange={(e) => setEditingShow({...editingShow, status: e.target.value as Show['status']})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-foreground">Design Status</Label>
                    <select 
                      value={editingShow.designStatus}
                      onChange={(e) => setEditingShow({...editingShow, designStatus: e.target.value as Show['designStatus']})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Waiting">Waiting</option>
                      <option value="Blend: Work in Progress">Blend: Work in Progress</option>
                      <option value="Retouch: Work in Progress">Retouch: Work in Progress</option>
                      <option value="Video: Work in Progress">Video: Work in Progress</option>
                      <option value="Done/Archived">Done/Archived</option>
                    </select>
                  </div>
                </div>
              </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button 
                    onClick={handleEditShow}
                    className="flex-1 h-10 text-sm font-medium"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingShow(null);
                    }}
                    className="h-10 text-sm px-6"
                  >
                    Hủy
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteShow(editingShow.id)}
                    className="h-10 text-sm px-6"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </Button>
                </div>
              </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {/* Payment Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Tổng giá trị</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(editingShow.price)}₫
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Đã thu</div>
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(editingShow.totalCollected)}₫
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Còn lại</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {formatCurrency(editingShow.amountDue)}₫
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Trạng thái</div>
                      <div className={`text-sm font-medium ${
                        editingShow.paymentStatus === 'Đã thanh toán đủ' ? 'text-green-600' :
                        editingShow.paymentStatus === 'Còn nợ' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {editingShow.paymentStatus}
                      </div>
                    </Card>
                  </div>

                  {/* Add Payment Form */}
                  <Card className="p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Thêm thanh toán mới
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Số tiền</Label>
                        <Input
                          type="number"
                          placeholder="Nhập số tiền"
                          value={newPayment.amount || ''}
                          onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Ngày thanh toán</Label>
                        <Input
                          type="date"
                          value={newPayment.date}
                          onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Loại</Label>
                        <select 
                          value={newPayment.type}
                          onChange={(e) => setNewPayment({...newPayment, type: e.target.value as Payment['type']})}
                          className="w-full px-2 py-1 border rounded text-xs h-8"
                        >
                          <option value="deposit">Tiền cọc</option>
                          <option value="installment">Đợt thanh toán</option>
                          <option value="final">Thanh toán cuối</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          size="sm" 
                          onClick={handleAddPayment}
                          disabled={newPayment.amount <= 0}
                          className="h-8 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Thêm
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-xs">Mô tả</Label>
                      <Input
                        placeholder="Mô tả thanh toán (tùy chọn)"
                        value={newPayment.description}
                        onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                        className="h-8 text-xs"
                      />
                    </div>
                  </Card>

                  {/* Payment History */}
                  <Card className="p-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Lịch sử thanh toán
                    </h4>
                    <div className="space-y-2">
                      {editingShow.payments.map((payment) => (
                        <div key={payment.id}>
                          {editingPayment?.id === payment.id ? (
                            // Edit mode
                            <div className="p-3 bg-muted/30 rounded-lg border-2 border-primary">
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                <div>
                                  <Label className="text-xs">Số tiền</Label>
                                  <Input
                                    type="number"
                                    value={editingPayment.amount}
                                    onChange={(e) => setEditingPayment({...editingPayment, amount: Number(e.target.value)})}
                                    className="h-7 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Ngày</Label>
                                  <Input
                                    type="date"
                                    value={editingPayment.date}
                                    onChange={(e) => setEditingPayment({...editingPayment, date: e.target.value})}
                                    className="h-7 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Loại</Label>
                                  <select 
                                    value={editingPayment.type}
                                    onChange={(e) => setEditingPayment({...editingPayment, type: e.target.value as Payment['type']})}
                                    className="w-full px-2 py-1 border rounded text-xs h-7"
                                  >
                                    <option value="deposit">Tiền cọc</option>
                                    <option value="installment">Đợt thanh toán</option>
                                    <option value="final">Thanh toán cuối</option>
                                  </select>
                                </div>
                                <div className="flex items-end gap-1">
                                  <Button 
                                    size="sm" 
                                    onClick={handleUpdatePayment}
                                    className="h-7 text-xs flex-1"
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Lưu
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setEditingPayment(null)}
                                    className="h-7 text-xs"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Mô tả</Label>
                                <Input
                                  value={editingPayment.description || ''}
                                  onChange={(e) => setEditingPayment({...editingPayment, description: e.target.value})}
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            // Display mode
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-green-600">
                                    +{formatCurrency(payment.amount)}₫
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    payment.type === 'deposit' ? 'bg-blue-100 text-blue-800' :
                                    payment.type === 'installment' ? 'bg-orange-100 text-orange-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {payment.type === 'deposit' ? 'Tiền cọc' :
                                     payment.type === 'installment' ? 'Đợt thanh toán' : 'Thanh toán cuối'}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {payment.description} • {new Date(payment.date).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {payment.recordedBy} • {new Date(payment.recordedAt).toLocaleString('vi-VN')}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditPayment(payment)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeletePayment(payment.id)}
                                  className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {editingShow.payments.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          Chưa có thanh toán nào được ghi nhận
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 mt-4">
                <Card className="p-4">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Lịch sử chỉnh sửa
                  </h4>
                  <div className="space-y-3">
                    {editingShow.auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{log.description}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.changedAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Trường:</span> {log.field} • 
                            <span className="font-medium"> Từ:</span> "{log.oldValue}" • 
                            <span className="font-medium"> Thành:</span> "{log.newValue}"
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Thực hiện bởi: <span className="font-medium">{log.changedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {editingShow.auditLogs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Chưa có lịch sử chỉnh sửa nào
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
} 