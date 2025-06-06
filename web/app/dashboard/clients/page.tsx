'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  UserCheck,
  Plus,
  Eye,
  Edit,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Camera,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  UserPlus,
  Star,
  DollarSign,
  History
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'Hoạt động' | 'Không hoạt động' | 'VIP';
  totalShows: number;
  totalSpent: number;
  lastShowDate: string;
  preferredServices: string[];
  notes: string;
}

interface ClientShow {
  id: string;
  clientId: string;
  clientName: string;
  showType: string;
  showDate: string;
  status: 'Hoàn thành' | 'Đang xử lý' | 'Đã hủy';
  totalValue: number;
  photographer: string;
}

const clientsData: Client[] = [
  {
    id: 'CL001',
    name: 'Nguyễn Văn A & Trần Thị B',
    email: 'wedding.ab@gmail.com',
    phone: '+84 901 234 567',
    address: 'Quận 1, TP.HCM',
    joinDate: '2023-06-15',
    status: 'VIP',
    totalShows: 3,
    totalSpent: 45000000,
    lastShowDate: '2024-01-15',
    preferredServices: ['Wedding', 'Pre-wedding'],
    notes: 'Khách hàng VIP, yêu cầu cao về chất lượng'
  },
  {
    id: 'CL002',
    name: 'Lê Thị C',
    email: 'lethic@gmail.com',
    phone: '+84 912 345 678',
    address: 'Quận 3, TP.HCM',
    joinDate: '2023-08-20',
    status: 'Hoạt động',
    totalShows: 2,
    totalSpent: 15000000,
    lastShowDate: '2023-12-10',
    preferredServices: ['Portrait', 'Family'],
    notes: 'Khách hàng thân thiện, dễ làm việc'
  },
  {
    id: 'CL003',
    name: 'Công ty ABC',
    email: 'events@abc.com',
    phone: '+84 923 456 789',
    address: 'Quận 7, TP.HCM',
    joinDate: '2023-03-10',
    status: 'Hoạt động',
    totalShows: 8,
    totalSpent: 80000000,
    lastShowDate: '2024-01-20',
    preferredServices: ['Corporate Event', 'Product Photography'],
    notes: 'Khách hàng doanh nghiệp, thường xuyên có sự kiện'
  }
];

const clientShowsData: ClientShow[] = [
  {
    id: 'SH001',
    clientId: 'CL001',
    clientName: 'Nguyễn Văn A & Trần Thị B',
    showType: 'Wedding',
    showDate: '2024-01-15',
    status: 'Hoàn thành',
    totalValue: 25000000,
    photographer: 'Nguyễn Văn A'
  },
  {
    id: 'SH002',
    clientId: 'CL002',
    clientName: 'Lê Thị C',
    showType: 'Portrait',
    showDate: '2023-12-10',
    status: 'Hoàn thành',
    totalValue: 8000000,
    photographer: 'Trần Thị B'
  },
  {
    id: 'SH003',
    clientId: 'CL003',
    clientName: 'Công ty ABC',
    showType: 'Corporate Event',
    showDate: '2024-01-20',
    status: 'Đang xử lý',
    totalValue: 15000000,
    photographer: 'Nguyễn Văn A'
  }
];

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hoạt động':
      case 'VIP':
      case 'Hoàn thành':
        return <CheckCircle className="h-3 w-3" />;
      case 'Đang xử lý':
        return <Clock className="h-3 w-3" />;
      case 'Không hoạt động':
      case 'Đã hủy':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoạt động':
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'VIP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Đang xử lý':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Không hoạt động':
      case 'Đã hủy':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Wedding':
      case 'Pre-wedding':
        return <Heart className="h-3 w-3" />;
      case 'Portrait':
      case 'Family':
        return <User className="h-3 w-3" />;
      case 'Corporate Event':
      case 'Product Photography':
        return <Camera className="h-3 w-3" />;
      default:
        return <Camera className="h-3 w-3" />;
    }
  };

  const tabs = [
    { id: 'list', label: 'Danh sách', icon: UserCheck },
    { id: 'shows', label: 'Lịch sử Shows', icon: History },
    { id: 'add-client', label: 'Thêm khách hàng', icon: UserPlus },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Quản lý Khách hàng
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Search className="h-3 w-3" />
            Tìm kiếm
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1">
            <UserPlus className="h-3 w-3" />
            Thêm khách hàng
          </Button>
        </div>
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
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8 px-2 text-xs border border-input bg-background rounded-md"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="VIP">VIP</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Không hoạt động">Không hoạt động</option>
              </select>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Filter className="h-3 w-3" />
                Lọc
              </Button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clientsData.map((client) => (
                <Card key={client.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{client.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{client.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(client.status)}`}>
                        {getStatusIcon(client.status)}
                        {client.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="space-y-2">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{client.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Gia nhập: {new Date(client.joinDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                        <div>
                          <span className="text-muted-foreground">Shows: </span>
                          <span className="font-medium">{client.totalShows}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tổng chi: </span>
                          <span className="font-medium text-green-600">{formatCurrency(client.totalSpent)}</span>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-muted-foreground">Show cuối: </span>
                        <span className="font-medium">{new Date(client.lastShowDate).toLocaleDateString('vi-VN')}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {client.preferredServices.slice(0, 2).map((service, index) => (
                          <span key={index} className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-muted rounded-full">
                            {getServiceIcon(service)}
                            {service}
                          </span>
                        ))}
                        {client.preferredServices.length > 2 && (
                          <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full">
                            +{client.preferredServices.length - 2}
                          </span>
                        )}
                      </div>

                      {client.notes && (
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                          {client.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          {client.status === 'VIP' && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                          <span className="text-xs font-medium">
                            {client.status === 'VIP' ? 'Khách VIP' : 'Khách thường'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shows' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Tổng shows: {clientShowsData.length}
              </div>
              <select className="h-8 px-2 text-xs border border-input bg-background rounded-md">
                <option value="all">Tất cả khách hàng</option>
                <option value="CL001">Nguyễn Văn A & Trần Thị B</option>
                <option value="CL002">Lê Thị C</option>
                <option value="CL003">Công ty ABC</option>
              </select>
            </div>

            <div className="space-y-3">
              {clientShowsData.map((show) => (
                <Card key={show.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{show.id}</span>
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(show.status)}`}>
                            {getStatusIcon(show.status)}
                            {show.status}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Show Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{show.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Camera className="h-3 w-3 text-muted-foreground" />
                            <span>{show.showType}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(show.showDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span>Photographer: {show.photographer}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial */}
                      <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Giá trị: </span>
                          <span className="font-medium text-green-600">{formatCurrency(show.totalValue)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add-client' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserPlus className="h-4 w-4" />
                Thêm khách hàng mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tên khách hàng *</Label>
                    <Input placeholder="Nguyễn Văn A" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Email *</Label>
                    <Input type="email" placeholder="client@gmail.com" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Số điện thoại *</Label>
                    <Input placeholder="+84 901 234 567" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Địa chỉ</Label>
                    <Input placeholder="Quận 1, TP.HCM" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Trạng thái *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn trạng thái</option>
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="VIP">VIP</option>
                      <option value="Không hoạt động">Không hoạt động</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Ngày gia nhập</Label>
                    <Input type="date" className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Dịch vụ quan tâm</Label>
                  <Input placeholder="Wedding, Portrait, Event (phân cách bằng dấu phẩy)" className="h-8 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Ghi chú</Label>
                  <textarea
                    placeholder="Thông tin bổ sung về khách hàng..."
                    className="w-full p-2 text-sm border border-input bg-background rounded-md resize-none h-16"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-xs gap-1">
                  <UserPlus className="h-3 w-3" />
                  Thêm khách hàng
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 