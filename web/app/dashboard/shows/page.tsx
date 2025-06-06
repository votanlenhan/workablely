'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Camera, 
  Plus, 
  Eye, 
  Edit, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface Show {
  id: string;
  client: {
    name: string;
    phone: string;
    email: string;
  };
  type: string;
  shootDate: string;
  deliveryDate: string;
  location: string;
  contractValue: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Hoàn thành' | 'Đang xử lý' | 'Chưa thu';
  description: string;
}

const showsData: Show[] = [
  {
    id: 'SH001',
    client: { name: 'Nguyễn Văn A', phone: '+84 901 234 567', email: 'a@gmail.com' },
    type: 'Wedding',
    shootDate: '2024-01-15',
    deliveryDate: '2024-01-30',
    location: 'Hà Nội',
    contractValue: 25000000,
    paidAmount: 15000000,
    remainingAmount: 10000000,
    status: 'Đang xử lý',
    description: 'Chụp cưới tại khách sạn Lotte'
  },
  {
    id: 'SH002',
    client: { name: 'Trần Thị B', phone: '+84 912 345 678', email: 'b@gmail.com' },
    type: 'Portrait',
    shootDate: '2024-01-16',
    deliveryDate: '2024-01-20',
    location: 'TP.HCM',
    contractValue: 8000000,
    paidAmount: 8000000,
    remainingAmount: 0,
    status: 'Hoàn thành',
    description: 'Chụp ảnh cá nhân'
  },
];

export default function ShowsPage() {
  const [newShow, setNewShow] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    type: '',
    shootDate: '',
    deliveryDate: '',
    location: '',
    contractValue: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating new show:', newShow);
    // TODO: Integrate with API
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return <CheckCircle className="h-3 w-3" />;
      case 'Đang xử lý':
        return <Clock className="h-3 w-3" />;
      case 'Chưa thu':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Quản lý Shows
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create New Show Form */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" />
              Tạo Show mới
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Client Information */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Thông tin khách hàng
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    placeholder="Tên khách hàng"
                    value={newShow.clientName}
                    onChange={(e) => setNewShow({...newShow, clientName: e.target.value})}
                    className="h-8 text-sm"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Số điện thoại"
                      value={newShow.clientPhone}
                      onChange={(e) => setNewShow({...newShow, clientPhone: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newShow.clientEmail}
                      onChange={(e) => setNewShow({...newShow, clientEmail: e.target.value})}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Show Details */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  Chi tiết show
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Loại show"
                    value={newShow.type}
                    onChange={(e) => setNewShow({...newShow, type: e.target.value})}
                    className="h-8 text-sm"
                    required
                  />
                  <Input
                    placeholder="Địa điểm"
                    value={newShow.location}
                    onChange={(e) => setNewShow({...newShow, location: e.target.value})}
                    className="h-8 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="Ngày chụp"
                    value={newShow.shootDate}
                    onChange={(e) => setNewShow({...newShow, shootDate: e.target.value})}
                    className="h-8 text-sm"
                    required
                  />
                  <Input
                    type="date"
                    placeholder="Ngày giao"
                    value={newShow.deliveryDate}
                    onChange={(e) => setNewShow({...newShow, deliveryDate: e.target.value})}
                    className="h-8 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Contract */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Hợp đồng
                </Label>
                <Input
                  type="number"
                  placeholder="Giá trị hợp đồng (VND)"
                  value={newShow.contractValue}
                  onChange={(e) => setNewShow({...newShow, contractValue: e.target.value})}
                  className="h-8 text-sm"
                  required
                />
                <textarea
                  placeholder="Mô tả chi tiết..."
                  value={newShow.description}
                  onChange={(e) => setNewShow({...newShow, description: e.target.value})}
                  className="w-full p-2 text-sm border border-input bg-background rounded-md resize-none h-16"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-8 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Tạo Show
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Shows List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Danh sách Shows ({showsData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {showsData.map((show) => (
                <div key={show.id} className="border border-border rounded-lg p-3 space-y-2">
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

                  {/* Client & Show Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{show.client.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{show.client.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{show.client.email}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Camera className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{show.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{show.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(show.shootDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div>
                        <span className="text-muted-foreground">Tổng: </span>
                        <span className="font-medium">{formatCurrency(show.contractValue)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Đã thu: </span>
                        <span className="font-medium text-green-600">{formatCurrency(show.paidAmount)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Còn lại: </span>
                        <span className={`font-medium ${show.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {formatCurrency(show.remainingAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 