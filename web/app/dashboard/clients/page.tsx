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
  History,
  X
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalShows: number;
  totalSpent: number;
  lastShowDate: string;
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
    totalShows: 3,
    totalSpent: 45000000,
    lastShowDate: '2024-01-15',
    notes: 'Khách hàng VIP, yêu cầu cao về chất lượng'
  },
  {
    id: 'CL002',
    name: 'Lê Thị C',
    email: 'lethic@gmail.com',
    phone: '+84 912 345 678',
    address: 'Quận 3, TP.HCM',
    totalShows: 2,
    totalSpent: 15000000,
    lastShowDate: '2023-12-10',
    notes: 'Khách hàng thân thiện, dễ làm việc'
  },
  {
    id: 'CL003',
    name: 'Công ty ABC',
    email: 'events@abc.com',
    phone: '+84 923 456 789',
    address: 'Quận 7, TP.HCM',
    totalShows: 8,
    totalSpent: 80000000,
    lastShowDate: '2024-01-20',
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
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(clientsData);
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Client operations
  const openClientModal = (mode: 'add' | 'edit', client?: Client) => {
    setModalMode(mode);
    setSelectedClient(client || null);
    if (mode === 'add') {
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
    } else if (client) {
      setNewClient({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        notes: client.notes
      });
    }
    setIsClientModalOpen(true);
  };

  const handleSaveClient = () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    const clientData = {
      ...newClient,
      totalShows: 0,
      totalSpent: 0,
      lastShowDate: ''
    };

    if (modalMode === 'add') {
      const newId = `CL${String(clients.length + 1).padStart(3, '0')}`;
      setClients([...clients, { id: newId, ...clientData }]);
    } else if (selectedClient) {
      setClients(clients.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...clientData }
          : client
      ));
    }

    setIsClientModalOpen(false);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const tabs = [
    { id: 'list', label: 'Danh sách', icon: UserCheck },
    { id: 'shows', label: 'Lịch sử Shows', icon: History },
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
          <Button 
            size="sm" 
            className="h-8 text-xs gap-1"
            onClick={() => openClientModal('add')}
          >
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
            {/* Search Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email, SĐT, địa chỉ, ghi chú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-sm pl-7"
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Filter className="h-3 w-3" />
                Lọc
              </Button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredClients.map((client) => (
                <Card 
                  key={client.id} 
                  className="hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => openClientModal('edit', client)}
                >
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <CardTitle className="text-xs font-medium">{client.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{client.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {client.totalShows} shows
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border">
                        <div className="text-xs">
                          <span className="text-muted-foreground">Tổng chi: </span>
                          <span className="font-medium text-green-600">{formatCurrency(client.totalSpent)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground">Show cuối: </span>
                          <span className="font-medium">{client.lastShowDate ? new Date(client.lastShowDate).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                        </div>
                      </div>

                      {client.notes && (
                        <div className="pt-1 border-t border-border">
                          <p className="text-xs text-muted-foreground italic truncate">{client.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shows' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Lịch sử Shows sẽ được hiển thị ở đây</p>
            </div>
          </div>
        )}
      </div>

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="bg-card border border-border shadow-2xl rounded-lg p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {modalMode === 'add' ? <Plus className="h-5 w-5 text-primary" /> : <Edit className="h-5 w-5 text-primary" />}
                {modalMode === 'add' ? 'Thêm Khách hàng mới' : 'Chỉnh sửa Khách hàng'}
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsClientModalOpen(false)}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Tên khách hàng *</Label>
                <Input
                  placeholder="Nhập tên khách hàng"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Email *</Label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Số điện thoại *</Label>
                <Input
                  placeholder="+84 xxx xxx xxx"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Địa chỉ</Label>
                <Input
                  placeholder="Nhập địa chỉ"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">Ghi chú</Label>
                <Input
                  placeholder="Ghi chú thêm về khách hàng"
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  className="h-10 text-sm bg-background border-input"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={handleSaveClient}
                  className="flex-1 h-10 text-sm font-medium"
                >
                  {modalMode === 'add' ? 'Thêm khách hàng' : 'Cập nhật'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsClientModalOpen(false)}
                  className="h-10 text-sm px-6"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 