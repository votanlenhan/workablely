'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shirt,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  Calendar,
  User,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';

interface RentalItem {
  id: string;
  name: string;
  category: string;
  size: string;
  color: string;
  dailyRate: number;
  status: 'Có sẵn' | 'Đã thuê' | 'Bảo trì';
  condition: 'Mới' | 'Tốt' | 'Khá' | 'Cần sửa';
  description: string;
}

interface RentalOrder {
  id: string;
  client: {
    name: string;
    phone: string;
    email: string;
  };
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    dailyRate: number;
  }[];
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  deposit: number;
  status: 'Đặt trước' | 'Đang thuê' | 'Đã trả' | 'Quá hạn';
  notes: string;
}

const rentalItems: RentalItem[] = [
  {
    id: 'R001',
    name: 'Váy cưới Princess',
    category: 'Váy cưới',
    size: 'M',
    color: 'Trắng',
    dailyRate: 2000000,
    status: 'Có sẵn',
    condition: 'Mới',
    description: 'Váy cưới kiểu công chúa với ren Pháp'
  },
  {
    id: 'R002',
    name: 'Vest nam cổ điển',
    category: 'Vest nam',
    size: 'L',
    color: 'Đen',
    dailyRate: 800000,
    status: 'Đã thuê',
    condition: 'Tốt',
    description: 'Vest nam cao cấp phong cách cổ điển'
  },
  {
    id: 'R003',
    name: 'Áo dài truyền thống',
    category: 'Áo dài',
    size: 'S',
    color: 'Đỏ',
    dailyRate: 500000,
    status: 'Có sẵn',
    condition: 'Tốt',
    description: 'Áo dài lụa tơ tằm thêu hoa sen'
  }
];

const rentalOrders: RentalOrder[] = [
  {
    id: 'RO001',
    client: {
      name: 'Nguyễn Văn A',
      phone: '+84 901 234 567',
      email: 'a@gmail.com'
    },
    items: [
      { itemId: 'R001', itemName: 'Váy cưới Princess', quantity: 1, dailyRate: 2000000 },
      { itemId: 'R002', itemName: 'Vest nam cổ điển', quantity: 1, dailyRate: 800000 }
    ],
    startDate: '2024-01-25',
    endDate: '2024-01-27',
    totalDays: 3,
    totalAmount: 8400000,
    deposit: 4000000,
    status: 'Đang thuê',
    notes: 'Cưới tại khách sạn Lotte'
  },
  {
    id: 'RO002',
    client: {
      name: 'Trần Thị B',
      phone: '+84 912 345 678',
      email: 'b@gmail.com'
    },
    items: [
      { itemId: 'R003', itemName: 'Áo dài truyền thống', quantity: 2, dailyRate: 500000 }
    ],
    startDate: '2024-01-30',
    endDate: '2024-01-30',
    totalDays: 1,
    totalAmount: 1000000,
    deposit: 500000,
    status: 'Đặt trước',
    notes: 'Chụp ảnh gia đình Tết'
  }
];

export default function RentalsPage() {
  const [activeTab, setActiveTab] = useState('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Có sẵn':
      case 'Đã trả':
        return <CheckCircle className="h-3 w-3" />;
      case 'Đang thuê':
        return <Clock className="h-3 w-3" />;
      case 'Quá hạn':
      case 'Bảo trì':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Có sẵn':
      case 'Đã trả':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Đang thuê':
      case 'Đặt trước':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Quá hạn':
      case 'Bảo trì':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Mới':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Tốt':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Khá':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Cần sửa':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'items', label: 'Trang phục', icon: Shirt },
    { id: 'orders', label: 'Đơn thuê', icon: Package },
    { id: 'add-item', label: 'Thêm trang phục', icon: Plus },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Quản lý Thuê đồ
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Search className="h-3 w-3" />
            Tìm kiếm
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1">
            <Plus className="h-3 w-3" />
            Đơn thuê mới
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
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm trang phục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2 text-xs border border-input bg-background rounded-md"
              >
                <option value="all">Tất cả danh mục</option>
                <option value="Váy cưới">Váy cưới</option>
                <option value="Vest nam">Vest nam</option>
                <option value="Áo dài">Áo dài</option>
                <option value="Phụ kiện">Phụ kiện</option>
              </select>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Filter className="h-3 w-3" />
                Lọc
              </Button>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rentalItems.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Danh mục:</span>
                          <div className="font-medium">{item.category}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <div className="font-medium">{item.size}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Màu:</span>
                          <div className="font-medium">{item.color}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Giá/ngày:</span>
                          <div className="font-medium text-green-600">{formatCurrency(item.dailyRate)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {item.status}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getConditionColor(item.condition)}`}>
                            {item.condition}
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

                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Tổng đơn thuê: {rentalOrders.length}
              </div>
              <Button size="sm" className="h-8 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Đơn thuê mới
              </Button>
            </div>

            <div className="space-y-3">
              {rentalOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
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

                      {/* Client & Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{order.client.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{order.client.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(order.startDate).toLocaleDateString('vi-VN')} - {new Date(order.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {order.totalDays} ngày • {order.items.length} món đồ
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Trang phục thuê:</div>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                            <span>{item.itemName} x{item.quantity}</span>
                            <span className="font-medium">{formatCurrency(item.dailyRate)}/ngày</span>
                          </div>
                        ))}
                      </div>

                      {/* Financial */}
                      <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                        <div className="grid grid-cols-3 gap-3 flex-1">
                          <div>
                            <span className="text-muted-foreground">Tổng tiền: </span>
                            <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Đặt cọc: </span>
                            <span className="font-medium text-blue-600">{formatCurrency(order.deposit)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Còn lại: </span>
                            <span className="font-medium text-orange-600">
                              {formatCurrency(order.totalAmount - order.deposit)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                          <strong>Ghi chú:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add-item' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Thêm trang phục mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tên trang phục *</Label>
                    <Input placeholder="Ví dụ: Váy cưới Princess" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Danh mục *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn danh mục</option>
                      <option value="Váy cưới">Váy cưới</option>
                      <option value="Vest nam">Vest nam</option>
                      <option value="Áo dài">Áo dài</option>
                      <option value="Phụ kiện">Phụ kiện</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Size *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Màu sắc *</Label>
                    <Input placeholder="Ví dụ: Trắng, Đen, Đỏ" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Giá thuê/ngày (VND) *</Label>
                    <Input type="number" placeholder="500000" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tình trạng *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn tình trạng</option>
                      <option value="Mới">Mới</option>
                      <option value="Tốt">Tốt</option>
                      <option value="Khá">Khá</option>
                      <option value="Cần sửa">Cần sửa</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Mô tả chi tiết</Label>
                  <textarea
                    placeholder="Mô tả chi tiết về trang phục..."
                    className="w-full p-2 text-sm border border-input bg-background rounded-md resize-none h-16"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-xs gap-1">
                  <Plus className="h-3 w-3" />
                  Thêm trang phục
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 