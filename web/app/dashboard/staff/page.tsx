'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users,
  Plus,
  Eye,
  Edit,
  User,
  Phone,
  Mail,
  Calendar,
  Star,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  UserPlus,
  Camera,
  Palette,
  Shield
} from 'lucide-react';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'Hoạt động' | 'Nghỉ phép' | 'Tạm nghỉ';
  skills: string[];
  rating: number;
  totalShows: number;
  baseSalary: number;
}

interface Performance {
  staffId: string;
  staffName: string;
  month: string;
  showsCompleted: number;
  averageRating: number;
  totalEarnings: number;
  feedback: string;
}

const staffData: Staff[] = [
  {
    id: 'ST001',
    name: 'Nguyễn Văn A',
    email: 'a@workablely.com',
    phone: '+84 901 234 567',
    role: 'Photographer',
    department: 'Photography',
    joinDate: '2023-01-15',
    status: 'Hoạt động',
    skills: ['Wedding Photography', 'Portrait', 'Event'],
    rating: 4.8,
    totalShows: 45,
    baseSalary: 15000000
  },
  {
    id: 'ST002',
    name: 'Trần Thị B',
    email: 'b@workablely.com',
    phone: '+84 912 345 678',
    role: 'Editor',
    department: 'Post-Production',
    joinDate: '2023-03-20',
    status: 'Hoạt động',
    skills: ['Photoshop', 'Lightroom', 'Color Grading'],
    rating: 4.6,
    totalShows: 38,
    baseSalary: 12000000
  },
  {
    id: 'ST003',
    name: 'Lê Văn C',
    email: 'c@workablely.com',
    phone: '+84 923 456 789',
    role: 'Assistant',
    department: 'Photography',
    joinDate: '2023-06-10',
    status: 'Nghỉ phép',
    skills: ['Equipment Setup', 'Client Support', 'Lighting'],
    rating: 4.3,
    totalShows: 22,
    baseSalary: 8000000
  }
];

const performanceData: Performance[] = [
  {
    staffId: 'ST001',
    staffName: 'Nguyễn Văn A',
    month: 'Tháng 1/2024',
    showsCompleted: 8,
    averageRating: 4.9,
    totalEarnings: 20000000,
    feedback: 'Hiệu suất xuất sắc, khách hàng rất hài lòng'
  },
  {
    staffId: 'ST002',
    staffName: 'Trần Thị B',
    month: 'Tháng 1/2024',
    showsCompleted: 12,
    averageRating: 4.7,
    totalEarnings: 15000000,
    feedback: 'Chất lượng edit tốt, giao hàng đúng hạn'
  },
  {
    staffId: 'ST003',
    staffName: 'Lê Văn C',
    month: 'Tháng 1/2024',
    showsCompleted: 5,
    averageRating: 4.2,
    totalEarnings: 10000000,
    feedback: 'Cần cải thiện kỹ năng giao tiếp với khách hàng'
  }
];

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Filter staff based on search term and department
  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = searchTerm === '' || 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Hoạt động':
        return <CheckCircle className="h-3 w-3" />;
      case 'Nghỉ phép':
        return <Clock className="h-3 w-3" />;
      case 'Tạm nghỉ':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoạt động':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Nghỉ phép':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Tạm nghỉ':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Photographer':
        return <Camera className="h-4 w-4" />;
      case 'Editor':
        return <Palette className="h-4 w-4" />;
      case 'Assistant':
        return <User className="h-4 w-4" />;
      case 'Manager':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const tabs = [
    { id: 'list', label: 'Danh sách', icon: Users },
    { id: 'performance', label: 'Hiệu suất', icon: Award },
    { id: 'add-staff', label: 'Thêm nhân viên', icon: UserPlus },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Quản lý Nhân viên
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Search className="h-3 w-3" />
            Tìm kiếm
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1">
            <UserPlus className="h-3 w-3" />
            Thêm nhân viên
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
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, SĐT, kỹ năng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-sm pl-7"
                  />
                </div>
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-8 px-2 text-xs border border-input bg-background rounded-md"
              >
                <option value="all">Tất cả phòng ban</option>
                <option value="Photography">Photography</option>
                <option value="Post-Production">Post-Production</option>
                <option value="Management">Management</option>
                <option value="Sales">Sales</option>
              </select>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Filter className="h-3 w-3" />
                Lọc
              </Button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredStaff.map((staff) => (
                <Card key={staff.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-xs font-medium">{staff.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{staff.id}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded-full ${getStatusColor(staff.status)}`}>
                        {getStatusIcon(staff.status)}
                        {staff.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        {getRoleIcon(staff.role)}
                        <span className="font-medium">{staff.role}</span>
                        <span className="text-muted-foreground">• {staff.department}</span>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{staff.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{staff.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <div className="flex items-center gap-1">
                          {renderStars(staff.rating)}
                          <span className="text-xs font-medium ml-1">{staff.rating}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {staff.totalShows} shows
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {staff.skills.slice(0, 2).map((skill, index) => (
                          <span key={index} className="text-xs px-1 py-0.5 bg-muted rounded-full">
                            {skill}
                          </span>
                        ))}
                        {staff.skills.length > 2 && (
                          <span className="text-xs px-1 py-0.5 bg-muted rounded-full">
                            +{staff.skills.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">
                          {formatCurrency(staff.baseSalary)}/tháng
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
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

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Báo cáo hiệu suất tháng 1/2024
              </div>
              <select className="h-8 px-2 text-xs border border-input bg-background rounded-md">
                <option value="2024-01">Tháng 1/2024</option>
                <option value="2023-12">Tháng 12/2023</option>
                <option value="2023-11">Tháng 11/2023</option>
              </select>
            </div>

            <div className="space-y-3">
              {performanceData.map((performance) => (
                <Card key={performance.staffId} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {performance.staffName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{performance.staffName}</span>
                            <p className="text-xs text-muted-foreground">{performance.month}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(performance.averageRating)}
                          <span className="text-xs font-medium ml-1">{performance.averageRating}</span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-bold text-lg">{performance.showsCompleted}</div>
                          <div className="text-muted-foreground">Shows hoàn thành</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-bold text-lg text-green-600">
                            {formatCurrency(performance.totalEarnings)}
                          </div>
                          <div className="text-muted-foreground">Tổng thu nhập</div>
                        </div>
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="font-bold text-lg">{performance.averageRating}</div>
                          <div className="text-muted-foreground">Đánh giá TB</div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div className="text-xs bg-muted/30 rounded p-2">
                        <strong>Nhận xét:</strong> {performance.feedback}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add-staff' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserPlus className="h-4 w-4" />
                Thêm nhân viên mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Họ và tên *</Label>
                    <Input placeholder="Nguyễn Văn A" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Email *</Label>
                    <Input type="email" placeholder="a@workablely.com" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Số điện thoại *</Label>
                    <Input placeholder="+84 901 234 567" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Vai trò *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn vai trò</option>
                      <option value="Photographer">Photographer</option>
                      <option value="Editor">Editor</option>
                      <option value="Assistant">Assistant</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Phòng ban *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn phòng ban</option>
                      <option value="Photography">Photography</option>
                      <option value="Post-Production">Post-Production</option>
                      <option value="Management">Management</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Lương cơ bản (VND) *</Label>
                    <Input type="number" placeholder="10000000" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Ngày gia nhập *</Label>
                    <Input type="date" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Trạng thái *</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md" required>
                      <option value="">Chọn trạng thái</option>
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Nghỉ phép">Nghỉ phép</option>
                      <option value="Tạm nghỉ">Tạm nghỉ</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Kỹ năng</Label>
                  <Input placeholder="Wedding Photography, Portrait, Event (phân cách bằng dấu phẩy)" className="h-8 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Ghi chú</Label>
                  <textarea
                    placeholder="Thông tin bổ sung về nhân viên..."
                    className="w-full p-2 text-sm border border-input bg-background rounded-md resize-none h-16"
                  />
                </div>
                <Button type="submit" className="w-full h-8 text-xs gap-1">
                  <UserPlus className="h-3 w-3" />
                  Thêm nhân viên
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 