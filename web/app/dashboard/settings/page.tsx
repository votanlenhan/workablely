'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings,
  User,
  Building,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Key,
  Trash2,
  RefreshCw,
  Camera,
  Users,
  Plus,
  Clock,
  Star,
  GripVertical
} from 'lucide-react';

interface StudioSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  logo: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
}

interface SystemSettings {
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  backupFrequency: string;
}

const studioSettings: StudioSettings = {
  name: 'Workablely Studio',
  email: 'info@workablely.com',
  phone: '+84 901 234 567',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  website: 'https://workablely.com',
  description: 'Studio chụp ảnh chuyên nghiệp với đội ngũ nhiếp ảnh gia giàu kinh nghiệm',
  logo: '/logo.png'
};

const userProfile: UserProfile = {
  name: 'Admin User',
  email: 'admin@workablely.com',
  phone: '+84 901 234 567',
  role: 'Administrator',
  avatar: '/avatar.png'
};

const systemSettings: SystemSettings = {
  timezone: 'Asia/Ho_Chi_Minh',
  currency: 'VND',
  language: 'vi-VN',
  dateFormat: 'DD/MM/YYYY',
  emailNotifications: true,
  smsNotifications: false,
  autoBackup: true,
  backupFrequency: 'daily'
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('studio');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (section: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const tabs = [
    { id: 'studio', label: 'Studio', icon: Building },
    { id: 'profile', label: 'Hồ sơ', icon: User },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'system', label: 'Hệ thống', icon: Settings },
    { id: 'variables', label: 'Biến số', icon: Palette },
    { id: 'backup', label:'Sao lưu', icon: Database },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Cài đặt Hệ thống
        </h2>
        <Button size="sm" className="h-8 text-xs gap-1">
          <Save className="h-3 w-3" />
          Lưu tất cả
        </Button>
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
        {activeTab === 'studio' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4" />
                Thông tin Studio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tên Studio *</Label>
                    <Input defaultValue={studioSettings.name} className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Email *</Label>
                    <Input type="email" defaultValue={studioSettings.email} className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Số điện thoại *</Label>
                    <Input defaultValue={studioSettings.phone} className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Website</Label>
                    <Input defaultValue={studioSettings.website} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Địa chỉ *</Label>
                  <Input defaultValue={studioSettings.address} className="h-8 text-sm" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Mô tả Studio</Label>
                  <textarea
                    defaultValue={studioSettings.description}
                    className="w-full p-2 text-sm border border-input bg-background rounded-md resize-none h-16"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Logo Studio</Label>
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" className="h-8 text-sm flex-1" />
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Upload className="h-3 w-3" />
                      Tải lên
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-8 text-xs gap-1"
                  disabled={isLoading}
                  onClick={() => handleSave('studio')}
                >
                  <Save className="h-3 w-3" />
                  {isLoading ? 'Đang lưu...' : 'Lưu thông tin Studio'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'profile' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Hồ sơ cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">
                    {userProfile.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <Upload className="h-3 w-3" />
                      Thay đổi ảnh
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG tối đa 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Họ và tên *</Label>
                    <Input defaultValue={userProfile.name} className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Email *</Label>
                    <Input type="email" defaultValue={userProfile.email} className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Số điện thoại</Label>
                    <Input defaultValue={userProfile.phone} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Vai trò</Label>
                    <Input defaultValue={userProfile.role} className="h-8 text-sm" disabled />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-8 text-xs gap-1"
                  disabled={isLoading}
                  onClick={() => handleSave('profile')}
                >
                  <Save className="h-3 w-3" />
                  {isLoading ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4" />
                  Đổi mật khẩu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Mật khẩu hiện tại *</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        className="h-8 text-sm pr-8" 
                        required 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Mật khẩu mới *</Label>
                    <Input type="password" className="h-8 text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Xác nhận mật khẩu mới *</Label>
                    <Input type="password" className="h-8 text-sm" required />
                  </div>
                  <Button type="submit" className="w-full h-8 text-xs gap-1">
                    <Key className="h-3 w-3" />
                    Đổi mật khẩu
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Bảo mật nâng cao
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Xác thực 2 bước</p>
                      <p className="text-xs text-muted-foreground">Tăng cường bảo mật tài khoản</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Kích hoạt
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Phiên đăng nhập</p>
                      <p className="text-xs text-muted-foreground">Quản lý các thiết bị đã đăng nhập</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4" />
                Cài đặt thông báo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Email thông báo</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Show mới được tạo</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Thanh toán được ghi nhận</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Nhắc nhở thanh toán quá hạn</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Báo cáo doanh thu hàng tháng</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">SMS thông báo</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Thanh toán khẩn cấp</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Cảnh báo bảo mật</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Thông báo trong ứng dụng</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Hoạt động của nhân viên</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Cập nhật hệ thống</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full h-8 text-xs gap-1">
                  <Save className="h-3 w-3" />
                  Lưu cài đặt thông báo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'system' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4" />
                Cài đặt hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Múi giờ</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md">
                      <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                      <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
                      <option value="Asia/Singapore">Singapore (UTC+8)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Đơn vị tiền tệ</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md">
                      <option value="VND">Việt Nam Đồng (VND)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Ngôn ngữ</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md">
                      <option value="vi-VN">Tiếng Việt</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Định dạng ngày</Label>
                    <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-8 text-xs gap-1">
                  <Save className="h-3 w-3" />
                  Lưu cài đặt hệ thống
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'variables' && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Biến số Hệ thống
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Quản lý tất cả các trường dữ liệu, trạng thái và danh mục trong hệ thống
              </p>
            </div>

            {/* Variable Categories - 4 Columns x 2 Rows Layout */}
            <div className="space-y-4">
              
              {/* First Row - 4 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                
                {/* 1. Loại hình Shows */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                        <Camera className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Loại hình Shows</h4>
                        <p className="text-xs text-muted-foreground">Quản lý các loại hình chụp ảnh</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {[
                        { name: 'Chụp TT', days: 30 },
                        { name: 'Event', days: 7 },
                        { name: 'Chụp K.Y', days: 14 },
                        { name: 'Quay K.Y', days: 21 },
                        { name: 'Quay PSC', days: 45 },
                        { name: 'Chụp PSC', days: 30 },
                        { name: 'Makeup', days: 1 },
                        { name: 'Ảnh Thẻ', days: 3 }
                      ].map((type, index) => (
                        <div key={index} className="group space-y-1 p-1.5 rounded hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <Input 
                              defaultValue={type.name} 
                              className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 ml-6">
                            <span className="text-xs text-muted-foreground min-w-[60px]">Deadline:</span>
                            <Input 
                              type="number"
                              defaultValue={type.days} 
                              className="w-16 border-0 bg-transparent focus:bg-background focus:border-input h-6 text-xs text-center"
                              min="1"
                              max="365"
                            />
                            <span className="text-xs text-muted-foreground">ngày</span>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full justify-start h-7 text-xs text-muted-foreground">
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Thêm loại hình
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Khu vực */}
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Khu vực</h4>
                        <p className="text-xs text-muted-foreground">Các khu vực hoạt động</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {['Huyện Eakar', 'TP. Buôn Ma Thuột', 'Huyện Krông Pak', 'Huyện Cư M\'gar', 'Huyện Ea H\'leo'].map((area, index) => (
                        <div key={index} className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <Input 
                            defaultValue={area} 
                            className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full justify-start h-7 text-xs text-muted-foreground">
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Thêm khu vực
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Số thợ */}
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center">
                        <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Số thợ</h4>
                        <p className="text-xs text-muted-foreground">Cấu hình số lượng thợ</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <div key={num} className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                          <Input 
                            defaultValue={num.toString()} 
                            className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full justify-start h-7 text-xs text-muted-foreground">
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Thêm số thợ
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Trạng thái Shows */}
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center">
                        <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Trạng thái Shows</h4>
                        <p className="text-xs text-muted-foreground">Quản lý trạng thái và màu sắc</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {[
                        { name: 'Chờ tới ngày chụp', color: '#6b7280' },
                        { name: 'Chờ design', color: '#1f2937' },
                        { name: 'Đang design', color: '#3b82f6' },
                        { name: 'Hoàn thành', color: '#10b981' }
                      ].map((status, index) => (
                        <div key={index} className="group flex items-center gap-2 p-1.5 rounded border hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div 
                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <Input 
                            defaultValue={status.name} 
                            className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs font-medium"
                          />
                          <Input 
                            type="color" 
                            defaultValue={status.color}
                            className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Second Row - 4 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* 5. Trạng thái Design */}
                <Card className="border-l-4 border-l-pink-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-pink-100 dark:bg-pink-900/30 rounded flex items-center justify-center">
                        <Palette className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Trạng thái Design</h4>
                        <p className="text-xs text-muted-foreground">Quản lý workflow design</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {[
                        { name: 'Not Started', display: 'Chưa bắt đầu', color: '#6b7280' },
                        { name: 'Waiting', display: 'Chờ xử lý', color: '#ef4444' },
                        { name: 'Blend: Work in Progress', display: 'Blend', color: '#f97316' },
                        { name: 'Retouch: Work in Progress', display: 'Retouch', color: '#eab308' },
                        { name: 'Video: Work in Progress', display: 'Video', color: '#8b5cf6' },
                        { name: 'Done/Archived', display: 'Hoàn thành', color: '#10b981' }
                      ].map((status, index) => (
                        <div key={index} className="group flex items-center gap-2 p-1.5 rounded border hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div 
                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: status.color }}
                          ></div>
                          <div className="flex-1">
                            <Input 
                              defaultValue={status.display} 
                              className="border-0 bg-transparent focus:bg-background focus:border-input h-6 text-xs font-medium"
                            />
                            <p className="text-xs text-muted-foreground leading-none">{status.name}</p>
                          </div>
                          <Input 
                            type="color" 
                            defaultValue={status.color}
                            className="w-7 h-7 p-0 border-0 rounded cursor-pointer"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 6. Chi cố định */}
                <Card className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                        <Database className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Chi cố định</h4>
                        <p className="text-xs text-muted-foreground">Danh mục chi phí</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {['Thuê mặt bằng', 'Điện nước', 'Internet', 'Bảo hiểm', 'Thuế'].map((expense, index) => (
                        <div key={index} className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          <Input 
                            defaultValue={expense} 
                            className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full justify-start h-7 text-xs text-muted-foreground">
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Thêm danh mục
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 7. Chi Wishlist */}
                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded flex items-center justify-center">
                        <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Chi Wishlist</h4>
                        <p className="text-xs text-muted-foreground">Danh mục mong muốn</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {['Thiết bị mới', 'Nâng cấp studio', 'Khóa học', 'Marketing', 'Du lịch'].map((wishlist, index) => (
                        <div key={index} className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          <Input 
                            defaultValue={wishlist} 
                            className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full justify-start h-7 text-xs text-muted-foreground">
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Thêm mục mong muốn
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 8. Thu ngoài */}
                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                        <Plus className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Thu ngoài</h4>
                        <p className="text-xs text-muted-foreground">Danh mục thu nhập</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {['Cho thuê thiết bị', 'Khóa học', 'Tư vấn', 'Hợp tác', 'Bán ảnh'].map((income, index) => (
                        <div key={index} className="group flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <Input 
                            defaultValue={income} 
                            className="flex-1 border-0 bg-transparent focus:bg-background focus:border-input h-7 text-xs"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="ghost" className="w-full justify-start h-7 text-xs text-muted-foreground">
                        <Plus className="h-2.5 w-2.5 mr-1" />
                        Thêm danh mục thu
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  Sao lưu dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Sao lưu tự động</p>
                        <p className="text-xs text-muted-foreground">Tự động sao lưu dữ liệu hàng ngày</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Tần suất sao lưu</Label>
                      <select className="w-full h-8 px-2 text-sm border border-input bg-background rounded-md">
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                        <option value="monthly">Hàng tháng</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-medium">Sao lưu thủ công</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1 flex-1">
                        <Download className="h-3 w-3" />
                        Tải xuống backup
                      </Button>
                      <Button size="sm" className="h-8 text-xs gap-1 flex-1">
                        <RefreshCw className="h-3 w-3" />
                        Tạo backup ngay
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-medium">Khôi phục dữ liệu</h4>
                    <div className="space-y-2">
                      <Input type="file" accept=".sql,.zip" className="h-8 text-sm" />
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1 w-full">
                        <Upload className="h-3 w-3" />
                        Khôi phục từ file
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-red-600">
                      ⚠️ Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-red-600">
                  <Trash2 className="h-4 w-4" />
                  Vùng nguy hiểm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Xóa toàn bộ dữ liệu</p>
                    <p className="text-xs text-muted-foreground">Thao tác này không thể hoàn tác</p>
                  </div>
                  <Button variant="destructive" size="sm" className="h-8 text-xs gap-1">
                    <Trash2 className="h-3 w-3" />
                    Xóa tất cả dữ liệu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 