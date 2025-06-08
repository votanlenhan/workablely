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
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Hash
} from 'lucide-react';
import { DatePickerInput } from '@/components/ui/date-picker';
import { calculateDeadline } from '@/lib/system-variables';
import { useYear } from '@/lib/year-context';

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
  stt: number;
  shootDate: string;
  deadline: string;
  shootTime: string;
  customer: string;
  phone: string;
  price: number;
  discount: number;
  finalPrice: number;
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
  khuVuc: string;
  soTho: number;
  payments: Payment[];
  auditLogs: AuditLog[];
  totalCollected: number;
  amountDue: number;
  paymentStatus: 'Chưa thanh toán' | 'Còn nợ' | 'Đã thanh toán đủ';
}

const getShowsData = (year: number): Show[] => [
  {
    id: 'SH006',
    stt: 6,
    shootDate: `${year}-01-18`,
    deadline: `${year}-01-24`,
    shootTime: 'Cả ngày',
    customer: '12A12 THPT Chu Văn An',
    phone: '',
    price: 6800000,
    discount: 0,
    finalPrice: 6800000,
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
    khuVuc: 'Huyện Eakar',
    soTho: 4,
    payments: [],
    auditLogs: [],
    totalCollected: 3300000,
    amountDue: 3500000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH005',
    stt: 5,
    shootDate: `${year}-01-12`,
    deadline: `${year}-01-21`,
    shootTime: 'Chiều',
    customer: '12A5 Cao Nguyên (Chụp)',
    phone: '',
    price: 4830000,
    discount: 300000,
    finalPrice: 4530000,
    deposit: 3150000,
    paid: 1680000,
    type: 'Chụp K.Y',
    key: 'Đạt',
    support1: 'Long',
    support2: 'Lai',
    selective: '',
    blend: '',
    retouch: '',
    khuVuc: 'Huyện Eakar',
    soTho: 3,
    status: 'Chờ design',
    designStatus: 'Blend: Work in Progress',
    payments: [],
    auditLogs: [],
    totalCollected: 1680000,
    amountDue: 3150000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH004',
    stt: 4,
    shootDate: `${year}-01-12`,
    deadline: `${year}-01-12`,
    shootTime: 'Sáng',
    customer: '12A8 THPT Cao Ba Quát',
    phone: '',
    price: 4720000,
    discount: 0,
    finalPrice: 4720000,
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
    khuVuc: 'Huyện Eakar',
    soTho: 5,
    payments: [],
    auditLogs: [],
    totalCollected: 1000000,
    amountDue: 3720000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH003',
    stt: 3,
    shootDate: `${year}-01-10`,
    deadline: `${year}-01-24`,
    shootTime: 'Chiều',
    customer: 'YEP SG',
    phone: '',
    price: 4600000,
    discount: 200000,
    finalPrice: 4400000,
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
    khuVuc: 'Huyện Eakar',
    soTho: 4,
    payments: [
      {
        id: 'p3',
        amount: 1500000,
        date: `${year}-01-08`,
        type: 'deposit',
        description: 'Tiền cọc 50%',
        recordedBy: 'Manager',
        recordedAt: `${year}-01-08T14:20:00Z`
      }
    ],
    auditLogs: [
      {
        id: 'a3',
        field: 'status',
        oldValue: 'Chờ tới ngày chụp',
        newValue: 'Chờ design',
        changedBy: 'Manager',
        changedAt: `${year}-01-10T18:30:00Z`,
        description: 'Hoàn thành buổi chụp'
      }
    ],
    totalCollected: 1500000,
    amountDue: 3100000,
    paymentStatus: 'Còn nợ'
  },
  {
    id: 'SH002',
    stt: 2,
    shootDate: `${year}-01-08`,
    deadline: `${year}-01-24`,
    shootTime: 'Cả ngày',
    customer: 'YEP Thanh Mai',
    phone: '',
    price: 2560000,
    discount: 60000,
    finalPrice: 2500000,
    deposit: 1000000,
    paid: 2500000,
    type: 'Event',
    key: 'Đạt',
    support1: 'An',
    support2: '',
    selective: '',
    blend: '',
    retouch: '',
    status: 'Hoàn thành',
    designStatus: 'Done/Archived',
    khuVuc: 'Huyện Eakar',
    soTho: 3,
    payments: [],
    auditLogs: [],
    totalCollected: 2500000,
    amountDue: 0,
    paymentStatus: 'Đã thanh toán đủ'
  },
  {
    id: 'SH001',
    stt: 1,
    shootDate: `${year}-01-05`,
    deadline: `${year}-01-20`,
    shootTime: 'Sáng',
    customer: 'TT Gia Nghĩa',
    phone: '',
    price: 1750000,
    discount: 0,
    finalPrice: 1750000,
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
    khuVuc: 'Huyện Eakar',
    soTho: 2,
    payments: [
      {
        id: 'p1',
        amount: 1000000,
        date: `${year-1}-12-20`,
        type: 'deposit',
        description: 'Tiền cọc đặt lịch',
        recordedBy: 'Admin',
        recordedAt: `${year-1}-12-20T10:30:00Z`
      },
      {
        id: 'p2',
        amount: 750000,
        date: `${year}-01-05`,
        type: 'final',
        description: 'Thanh toán cuối khi giao hàng',
        recordedBy: 'Admin',
        recordedAt: `${year}-01-05T15:45:00Z`
      }
    ],
    auditLogs: [
      {
        id: 'a1',
        field: 'status',
        oldValue: 'Chờ design',
        newValue: 'Hoàn thành',
        changedBy: 'Admin',
        changedAt: `${year}-01-05T16:00:00Z`,
        description: 'Cập nhật trạng thái hoàn thành'
      },
      {
        id: 'a2',
        field: 'key',
        oldValue: 'An',
        newValue: 'Đạt',
        changedBy: 'Manager',
        changedAt: `${year-1}-12-25T09:15:00Z`,
        description: 'Thay đổi photographer chính'
      }
    ],
    totalCollected: 1750000,
    amountDue: 0,
    paymentStatus: 'Đã thanh toán đủ'
  }
];

// Calendar Component
function CalendarView({ shows, onShowClick }: { shows: Show[], onShowClick: (showId: string) => void }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Lịch Shows
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-7 text-xs"
            >
              Hôm nay
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[140px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="bg-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 gap-px">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-muted-foreground bg-muted/50 text-xs">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-px">
            {/* Empty days */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="p-2 min-h-[120px] bg-background"></div>
            ))}
            
            {/* Days with shows */}
            {days.map(day => {
              const dayShows = getShowsForDate(day);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isCurrentMonth = true;
              
              return (
                <div key={day} className={`p-2 min-h-[120px] bg-background hover:bg-muted/30 transition-colors cursor-pointer ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className={`font-medium mb-1 text-xs ${isToday ? 'text-blue-600 font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayShows.map(show => {
                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'Chờ tới ngày chụp': return 'bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-400';
                        case 'Chờ design': return 'bg-gray-900/10 dark:bg-gray-100/10 text-gray-900 dark:text-gray-100 border-gray-900 dark:border-gray-100';
                        case 'Đang design': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-500';
                        case 'Hoàn thành': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-500';
                        default: return 'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200 border-gray-500';
                      }
                    };

                    const formatCurrency = (amount: number) => {
                      return new Intl.NumberFormat('vi-VN').format(amount);
                    };

                    return (
                      <div 
                        key={show.id} 
                        className={`px-1 py-1 rounded text-xs border-l-2 cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(show.status)}`}
                        onClick={() => onShowClick(show.id)}
                        title={`${show.customer} - ${show.type}\nGiờ: ${show.shootTime}\nGiá: ${formatCurrency(show.price)} VND\nKey: ${show.key || 'Chưa gán'}\nTrạng thái: ${show.status}`}
                      >
                        <div className="font-medium truncate">{show.customer}</div>
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {show.shootTime || 'Chưa xác định'}
                        </div>
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <Camera className="h-2.5 w-2.5" />
                          {show.type}
                        </div>
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <User className="h-2.5 w-2.5" />
                          {show.key || 'Chưa gán'}
                        </div>
                        {(show.support1 || show.support2) && (
                          <div className="text-xs opacity-75 truncate flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" />
                            {[show.support1, show.support2].filter(Boolean).join(', ')}
                          </div>
                        )}
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <Kanban className="h-2.5 w-2.5" />
                          {show.designStatus}
                        </div>
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <Users className="h-2.5 w-2.5" />
                          {show.soTho} thợ
                        </div>
                        <div className="text-xs opacity-75 truncate flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {show.khuVuc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Design Board Component
function DesignBoard({ shows, onUpdateShow, onShowClick }: { shows: Show[], onUpdateShow: (id: string, updates: Partial<Show>) => void, onShowClick: (showId: string) => void }) {
  const stages = [
    { 
      id: 'Not Started', 
      title: 'Chưa bắt đầu', 
      color: 'bg-gray-50 dark:bg-gray-900/50',
      headerColor: 'text-gray-700 dark:text-gray-300',
      count: 0
    },
    { 
      id: 'Waiting', 
      title: 'Chờ xử lý', 
      color: 'bg-red-50 dark:bg-red-900/20',
      headerColor: 'text-red-700 dark:text-red-300',
      count: 0
    },
    { 
      id: 'Blend: Work in Progress', 
      title: 'Blend', 
      color: 'bg-orange-50 dark:bg-orange-900/20',
      headerColor: 'text-orange-700 dark:text-orange-300',
      count: 0
    },
    { 
      id: 'Retouch: Work in Progress', 
      title: 'Retouch', 
      color: 'bg-yellow-50 dark:bg-yellow-900/20',
      headerColor: 'text-yellow-700 dark:text-yellow-300',
      count: 0
    },
    { 
      id: 'Video: Work in Progress', 
      title: 'Video', 
      color: 'bg-purple-50 dark:bg-purple-900/20',
      headerColor: 'text-purple-700 dark:text-purple-300',
      count: 0
    },
    { 
      id: 'Done/Archived', 
      title: 'Hoàn thành', 
      color: 'bg-green-50 dark:bg-green-900/20',
      headerColor: 'text-green-700 dark:text-green-300',
      count: 0
    }
  ];
  
  const getShowsForStage = (stageId: string) => {
    return shows.filter(show => show.designStatus === stageId);
  };

  // Update counts
  stages.forEach(stage => {
    stage.count = getShowsForStage(stage.id).length;
  });
  
  const handleDragStart = (e: React.DragEvent, showId: string) => {
    e.dataTransfer.setData('text/plain', showId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };
  
  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const showId = e.dataTransfer.getData('text/plain');
    onUpdateShow(showId, { designStatus: stageId as Show['designStatus'] });
    
    // Remove drag over styling
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ tới ngày chụp': return 'bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300';
      case 'Chờ design': return 'bg-gray-900/10 text-gray-900 dark:bg-gray-100/10 dark:text-gray-100';
      case 'Đang design': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Hoàn thành': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          Bảng Tiến trình Design
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-6 gap-3">
          {stages.map(stage => (
            <div 
              key={stage.id}
              className={`rounded-lg min-h-[500px] transition-all duration-200 ${stage.color}`}
              onDrop={(e) => handleDrop(e, stage.id)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${stage.headerColor}`}>
                    {stage.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 ${stage.headerColor}`}>
                    {stage.count}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2">
                {getShowsForStage(stage.id).map(show => (
                  <div
                    key={show.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, show.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onShowClick(show.id)}
                    className="group p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-foreground truncate flex-1">
                        #{show.stt} - {show.customer}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ml-2 ${getStatusColor(show.status)}`}>
                        {show.status}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{show.shootTime || 'Chưa xác định'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        <span>{show.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Key: {show.key || 'Chưa phân'}</span>
                      </div>
                      
                      {(show.support1 || show.support2) && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>SP: {[show.support1, show.support2].filter(Boolean).join(', ')}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Kanban className="h-3 w-3" />
                        <span>{show.designStatus}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{show.soTho} thợ</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{show.khuVuc}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(show.shootDate).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          {(show.price / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {getShowsForStage(stage.id).length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-xs">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </div>
                    Chưa có show nào
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShowsPage() {
  const { currentYear } = useYear();
  const [shows, setShows] = useState<Show[]>(getShowsData(currentYear));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [newShow, setNewShow] = useState({
    shootDate: new Date().toISOString().split('T')[0],
    deadline: calculateDeadline(new Date().toISOString().split('T')[0], 'Chụp TT'),
    shootTime: '',
    customer: '',
    phone: '',
    price: 0,
    discount: 0,
    finalPrice: 0,
    deposit: 0,
    paid: 0,
    type: 'Chụp TT',
    khuVuc: 'Huyện Eakar',
    soTho: 1,
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

  // Update shows data when year changes
  useEffect(() => {
    setShows(getShowsData(currentYear));
  }, [currentYear]);

  // Auto-update status based on shoot date and design status
  useEffect(() => {
    const updateStatuses = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setShows(prevShows => 
        prevShows.map(show => {
          const shootDate = new Date(show.shootDate);
          shootDate.setHours(0, 0, 0, 0);
          
          let newStatus = show.status;
          
          // Logic tự động tính trạng thái
          if (shootDate > today) {
            // Chưa tới ngày chụp
            newStatus = 'Chờ tới ngày chụp';
          } else if (shootDate <= today) {
            // Đã tới hoặc qua ngày chụp
            if (show.designStatus === 'Done/Archived') {
              newStatus = 'Hoàn thành';
            } else if (['Blend: Work in Progress', 'Retouch: Work in Progress', 'Video: Work in Progress'].includes(show.designStatus)) {
              newStatus = 'Đang design';
            } else {
              newStatus = 'Chờ design';
            }
          }
          
          return {
            ...show,
            status: newStatus
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
      // Calculate next STT (highest STT + 1)
      const maxStt = shows.length > 0 ? Math.max(...shows.map(s => s.stt)) : 0;
      const nextStt = maxStt + 1;
      const id = `SH${String(nextStt).padStart(3, '0')}`;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const shootDate = new Date(newShow.shootDate);
      shootDate.setHours(0, 0, 0, 0);
      
      const status = shootDate > today ? 'Chờ tới ngày chụp' : 'Chờ design';
      const designStatus = shootDate > today ? 'Not Started' : 'Waiting';
      
      const show: Show = {
        id,
        stt: nextStt,
        ...newShow,
        status: status as Show['status'],
        designStatus: designStatus as Show['designStatus'],
        payments: [],
        auditLogs: [],
        totalCollected: 0,
        amountDue: newShow.price,
        paymentStatus: 'Chưa thanh toán'
      };
      
      // Add new show at the beginning (newest first)
      setShows([show, ...shows]);
      setNewShow({
        shootDate: new Date().toISOString().split('T')[0],
        deadline: calculateDeadline(new Date().toISOString().split('T')[0], 'Chụp TT'),
        shootTime: '',
        customer: '',
        phone: '',
        price: 0,
        discount: 0,
        finalPrice: 0,
        deposit: 0,
        paid: 0,
        type: 'Chụp TT',
        khuVuc: 'Huyện Eakar',
        soTho: 1,
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
          { key: 'deadline', label: 'Deadline' },
          { key: 'shootTime', label: 'Thời gian' },
          { key: 'khuVuc', label: 'Khu vực' },
          { key: 'soTho', label: 'Số thợ' },
          { key: 'key', label: 'Key' },
          { key: 'support1', label: 'SP1' },
          { key: 'support2', label: 'SP2' },
          { key: 'selective', label: 'Pick' },
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
      case 'Chờ tới ngày chụp':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'Chờ design':
        return 'bg-gray-900/10 text-gray-900 dark:bg-gray-100/10 dark:text-gray-100';
      case 'Đang design':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
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
      show.stt.toString().includes(searchTerm) ||
      show.phone.includes(searchTerm) ||
      show.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.support1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.support2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.khuVuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      show.soTho.toString().includes(searchTerm);
    
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
                      <TabsTrigger value="calendar" className="text-xs">Lịch Đi Làm</TabsTrigger>
                      <TabsTrigger value="board" className="text-xs">Tiến Độ Design</TabsTrigger>
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
                      placeholder="Tìm kiếm theo STT, tên khách hàng, ID, SĐT, Key, SP, khu vực, số thợ..."
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
                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="shows-table-grid text-xs font-medium text-muted-foreground border-b pb-1">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    STT
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ngày chụp
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Deadline
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Thời gian
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Khách hàng
                  </div>
                  <div>Giá</div>
                  <div>% Discount</div>
                  <div>Loại</div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Khu vực
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Số thợ
                  </div>
                  <div>Key</div>
                  <div>SP1</div>
                  <div>SP2</div>
                  <div>Pick</div>
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
                        className="shows-table-grid py-1 text-xs border-b cursor-pointer hover:bg-muted/30"
                        onClick={() => handleRowClick(show.id)}
                      >
                        <div>
                          <span className="font-medium text-blue-600">#{show.stt}</span>
                        </div>
                        <div>
                          <span>{new Date(show.shootDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div>
                          <span>{new Date(show.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div>
                          <span>{show.shootTime || '-'}</span>
                        </div>
                        <div>
                          <div>
                            <div className="font-medium truncate">{show.customer}</div>
                            <div className={`${paymentStatus.color}`}>
                              {paymentStatus.text} • Còn {formatCurrency(remaining)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div>
                            {show.discount > 0 ? (
                              <>
                                <div className="text-xs text-muted-foreground line-through">{formatCurrency(show.price)}</div>
                                <div className="font-medium text-orange-600">
                                  {formatCurrency(show.finalPrice)}
                                </div>
                              </>
                            ) : (
                              <div className="font-medium">
                                {formatCurrency(show.finalPrice)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={`font-medium ${show.discount > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {show.discount > 0 ? `${Math.round((show.discount / show.price) * 100)}%` : '0%'}
                          </span>
                        </div>
                        <div>
                          <span className="px-1 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                            {show.type}
                          </span>
                        </div>
                        <div>
                          <span>{show.khuVuc}</span>
                        </div>
                        <div>
                          <span className="font-medium">{show.soTho}</span>
                        </div>
                        <div>
                          <span>{show.key || '-'}</span>
                        </div>
                        <div>
                          <span>{show.support1 || '-'}</span>
                        </div>
                        <div>
                          <span>{show.support2 || '-'}</span>
                        </div>
                        <div>
                          <span>{show.selective || '-'}</span>
                        </div>
                        <div>
                          <span>{show.blend || '-'}</span>
                        </div>
                        <div>
                          <span>{show.retouch || '-'}</span>
                        </div>
                        <div>
                          <span className={`px-1 py-0.5 rounded-full flex items-center gap-1 ${getStatusColor(show.status)}`}>
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
                            <h3 className="font-medium text-sm">#{show.stt} - {show.customer}</h3>
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
                                            <span className="text-xs text-muted-foreground">Deadline:</span>
                <p className="text-sm">{new Date(show.deadline).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Giá:</span>
                            <div>
                              {show.discount > 0 ? (
                                <>
                                  <p className="text-xs text-muted-foreground line-through">{formatCurrency(show.price)}</p>
                                  <p className="text-sm font-medium text-orange-600">{formatCurrency(show.finalPrice)}</p>
                                </>
                              ) : (
                                <p className="text-sm font-medium">{formatCurrency(show.finalPrice)}</p>
                              )}
                            </div>
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
                          <div>
                            <span className="text-xs text-muted-foreground">Khu vực:</span>
                            <p className="text-sm">{show.khuVuc}</p>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Số thợ:</span>
                            <p className="text-sm font-medium">{show.soTho}</p>
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
                              Pick: {show.selective}
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
          <CalendarView shows={filteredShows} onShowClick={handleRowClick} />
        </TabsContent>
        
        <TabsContent value="board">
          <DesignBoard shows={filteredShows} onUpdateShow={handleUpdateShow} onShowClick={handleRowClick} />
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
                    onChange={(e) => {
                      const newShootDate = e.target.value;
                      const newDeadline = calculateDeadline(newShootDate, newShow.type);
                      setNewShow({...newShow, shootDate: newShootDate, deadline: newDeadline});
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Deadline</Label>
                  <Input
                    type="date"
                    value={newShow.deadline}
                    onChange={(e) => setNewShow({...newShow, deadline: e.target.value})}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs font-medium">Loại show</Label>
                  <select 
                    value={newShow.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newDeadline = calculateDeadline(newShow.shootDate, newType);
                      setNewShow({...newShow, type: newType, deadline: newDeadline});
                    }}
                    className="w-full px-2 py-1 border rounded-md text-xs h-8"
                    required
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-medium">Giá gốc (VND)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập giá gốc"
                    value={newShow.price}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      const finalPrice = newPrice - newShow.discount;
                      setNewShow({...newShow, price: newPrice, finalPrice: finalPrice});
                    }}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Discount (%)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập % discount"
                    value={newShow.price > 0 ? Math.round((newShow.discount / newShow.price) * 100) : 0}
                    onChange={(e) => {
                      const discountPercent = Number(e.target.value);
                      const newDiscount = Math.round((newShow.price * discountPercent) / 100);
                      const finalPrice = newShow.price - newDiscount;
                      setNewShow({...newShow, discount: newDiscount, finalPrice: finalPrice});
                    }}
                    className="h-8 text-xs"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Giá sau discount (VND)</Label>
                  <Input
                    type="number"
                    value={newShow.finalPrice}
                    className="h-8 text-xs bg-muted"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Bù lương thợ (VND)</Label>
                  <Input
                    type="number"
                    value={newShow.discount}
                    className="h-8 text-xs bg-muted"
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Khu vực</Label>
                  <Input
                    placeholder="VD: Huyện Eakar"
                    value={newShow.khuVuc}
                    onChange={(e) => setNewShow({...newShow, khuVuc: e.target.value})}
                    className="h-8 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Số thợ</Label>
                  <Input
                    type="number"
                    placeholder="Nhập số thợ"
                    value={newShow.soTho}
                    onChange={(e) => setNewShow({...newShow, soTho: Number(e.target.value)})}
                    className="h-8 text-xs"
                    min="1"
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
                    <Label className="text-xs">Pick</Label>
                    <select 
                      value={newShow.selective}
                      onChange={(e) => setNewShow({...newShow, selective: e.target.value})}
                      className="w-full px-2 py-1 border rounded text-xs h-8"
                    >
                      <option value="">Chọn Pick</option>
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
          <div className="bg-card border border-border rounded-lg p-4 w-full max-w-2xl h-[95vh] flex flex-col shadow-2xl">
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

            <Tabs defaultValue="info" className="w-full flex flex-col flex-1 min-h-0">
              <TabsList className="grid w-full grid-cols-3 h-auto flex-shrink-0">
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

              <TabsContent value="info" className="space-y-4 mt-4 flex-1 overflow-y-auto">

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">Ngày chụp</Label>
                  <Input
                    type="date"
                    value={editingShow.shootDate}
                    onChange={(e) => {
                      const newShootDate = e.target.value;
                      const newDeadline = calculateDeadline(newShootDate, editingShow.type);
                      setEditingShow({...editingShow, shootDate: newShootDate, deadline: newDeadline});
                    }}
                    className="h-10 text-sm bg-background border-input"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Deadline (Tự động)</Label>
                  <Input
                    type="date"
                    value={editingShow.deadline}
                    className="h-10 text-sm bg-muted border-input"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">Deadline được tính tự động dựa trên ngày chụp và loại show</p>
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
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newDeadline = calculateDeadline(editingShow.shootDate, newType);
                      setEditingShow({...editingShow, type: newType, deadline: newDeadline});
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    required
                  >
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Giá gốc (VND)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập giá gốc"
                    value={editingShow.price}
                    onChange={(e) => {
                      const newPrice = Number(e.target.value);
                      const finalPrice = newPrice - editingShow.discount;
                      setEditingShow({...editingShow, price: newPrice, finalPrice: finalPrice});
                    }}
                    className="h-10 text-sm bg-background border-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">Discount (%)</Label>
                  <Input
                    type="number"
                    placeholder="Nhập % discount"
                    value={editingShow.price > 0 ? Math.round((editingShow.discount / editingShow.price) * 100) : 0}
                    onChange={(e) => {
                      const discountPercent = Number(e.target.value);
                      const newDiscount = Math.round((editingShow.price * discountPercent) / 100);
                      const finalPrice = editingShow.price - newDiscount;
                      setEditingShow({...editingShow, discount: newDiscount, finalPrice: finalPrice});
                    }}
                    className="h-10 text-sm bg-background border-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Giá sau discount (VND)</Label>
                  <Input
                    type="number"
                    value={editingShow.finalPrice}
                    className="h-10 text-sm bg-muted border-input"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Bù lương thợ (VND)</Label>
                  <Input
                    type="number"
                    value={editingShow.discount}
                    className="h-10 text-sm bg-muted border-input"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">Số tiền discount sẽ được tự động thêm vào chi phí "Bù lương thợ"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-foreground">Khu vực</Label>
                  <Input
                    placeholder="VD: Huyện Eakar"
                    value={editingShow.khuVuc}
                    onChange={(e) => setEditingShow({...editingShow, khuVuc: e.target.value})}
                    className="h-10 text-sm bg-background border-input"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Số thợ</Label>
                  <Input
                    type="number"
                    placeholder="Nhập số thợ"
                    value={editingShow.soTho}
                    onChange={(e) => setEditingShow({...editingShow, soTho: Number(e.target.value)})}
                    className="h-10 text-sm bg-background border-input"
                    min="1"
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
                    <Label className="text-sm text-foreground">Pick</Label>
                    <select 
                      value={editingShow.selective}
                      onChange={(e) => setEditingShow({...editingShow, selective: e.target.value})}
                      className="w-full px-3 py-2 border border-input rounded-md text-sm h-10 bg-background text-foreground"
                    >
                      <option value="">Chọn Pick</option>
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
                    <Label className="text-sm text-foreground">Trạng thái (Tự động)</Label>
                    <Input
                      value={editingShow.status}
                      className="h-10 text-sm bg-muted border-input"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">Trạng thái được tính tự động dựa trên ngày chụp và design status</p>
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
              <TabsContent value="payments" className="space-y-4 mt-4 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Payment Summary */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Tổng giá trị</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(editingShow.finalPrice)}₫
                      </div>
                      {editingShow.discount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Gốc: {formatCurrency(editingShow.price)}₫ (-{formatCurrency(editingShow.discount)}₫)
                        </div>
                      )}
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
              <TabsContent value="history" className="space-y-4 mt-4 flex-1 overflow-y-auto">
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