// System Variables Configuration - Notion Style
// Quản lý tất cả các biến số, tên trường, màu sắc trong hệ thống

export interface SystemVariable {
  id: string;
  name: string;
  displayName: string;
  color?: string;
  icon?: string;
  category: string;
  type: 'status' | 'type' | 'area' | 'worker_count' | 'category' | 'field';
  editable: boolean;
  required: boolean;
  description?: string;
  deadlineDays?: number; // Số ngày để tính deadline từ ngày chụp
}

export interface SystemVariableCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  variables: SystemVariable[];
}

// Shows Status Variables
export const showStatusVariables: SystemVariable[] = [
  {
    id: 'show_status_waiting',
    name: 'Chờ tới ngày chụp',
    displayName: 'Chờ tới ngày chụp',
    color: '#6b7280',
    category: 'shows',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'show_status_waiting_design',
    name: 'Chờ design',
    displayName: 'Chờ Design',
    color: '#1f2937',
    category: 'shows',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'show_status_designing',
    name: 'Đang design',
    displayName: 'Đang Design',
    color: '#3b82f6',
    category: 'shows',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'show_status_completed',
    name: 'Hoàn thành',
    displayName: 'Hoàn thành',
    color: '#10b981',
    category: 'shows',
    type: 'status',
    editable: true,
    required: true
  }
];

// Shows Type Variables
export const showTypeVariables: SystemVariable[] = [
  {
    id: 'show_type_wedding',
    name: 'Chụp TT',
    displayName: 'Chụp TT',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Chụp ảnh cưới truyền thống',
    deadlineDays: 30
  },
  {
    id: 'show_type_event',
    name: 'Event',
    displayName: 'Event',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Chụp ảnh sự kiện',
    deadlineDays: 7
  },
  {
    id: 'show_type_ky_photo',
    name: 'Chụp K.Y',
    displayName: 'Chụp K.Y',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Chụp ảnh kỷ yếu',
    deadlineDays: 14
  },
  {
    id: 'show_type_ky_video',
    name: 'Quay K.Y',
    displayName: 'Quay K.Y',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Quay video kỷ yếu',
    deadlineDays: 21
  },
  {
    id: 'show_type_psc_video',
    name: 'Quay PSC',
    displayName: 'Quay PSC',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Quay video phóng sự cưới',
    deadlineDays: 45
  },
  {
    id: 'show_type_psc_photo',
    name: 'Chụp PSC',
    displayName: 'Chụp PSC',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Chụp ảnh phóng sự cưới',
    deadlineDays: 30
  },
  {
    id: 'show_type_makeup',
    name: 'Makeup',
    displayName: 'Makeup',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Dịch vụ trang điểm',
    deadlineDays: 1
  },
  {
    id: 'show_type_id_photo',
    name: 'Ảnh Thẻ',
    displayName: 'Ảnh Thẻ',
    category: 'shows',
    type: 'type',
    editable: true,
    required: false,
    description: 'Chụp ảnh thẻ các loại',
    deadlineDays: 3
  }
];

// Area Variables
export const areaVariables: SystemVariable[] = [
  {
    id: 'area_eakar',
    name: 'Huyện Eakar',
    displayName: 'Huyện Eakar',
    category: 'areas',
    type: 'area',
    editable: true,
    required: true,
    description: 'Khu vực mặc định'
  },
  {
    id: 'area_buon_ma_thuot',
    name: 'TP. Buôn Ma Thuột',
    displayName: 'TP. Buôn Ma Thuột',
    category: 'areas',
    type: 'area',
    editable: true,
    required: false,
    description: 'Thành phố trung tâm'
  },
  {
    id: 'area_krong_pak',
    name: 'Huyện Krông Pak',
    displayName: 'Huyện Krông Pak',
    category: 'areas',
    type: 'area',
    editable: true,
    required: false
  },
  {
    id: 'area_cu_mgar',
    name: 'Huyện Cư M\'gar',
    displayName: 'Huyện Cư M\'gar',
    category: 'areas',
    type: 'area',
    editable: true,
    required: false
  },
  {
    id: 'area_ea_hleo',
    name: 'Huyện Ea H\'leo',
    displayName: 'Huyện Ea H\'leo',
    category: 'areas',
    type: 'area',
    editable: true,
    required: false
  }
];

// Worker Count Variables
export const workerCountVariables: SystemVariable[] = [
  {
    id: 'worker_count_1',
    name: '1',
    displayName: '1 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: true,
    description: 'Số lượng thợ tối thiểu'
  },
  {
    id: 'worker_count_2',
    name: '2',
    displayName: '2 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  },
  {
    id: 'worker_count_3',
    name: '3',
    displayName: '3 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  },
  {
    id: 'worker_count_4',
    name: '4',
    displayName: '4 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  },
  {
    id: 'worker_count_5',
    name: '5',
    displayName: '5 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  },
  {
    id: 'worker_count_6',
    name: '6',
    displayName: '6 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  },
  {
    id: 'worker_count_7',
    name: '7',
    displayName: '7 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  },
  {
    id: 'worker_count_8',
    name: '8',
    displayName: '8 thợ',
    category: 'workers',
    type: 'worker_count',
    editable: false,
    required: false
  }
];

// Design Status Variables
export const designStatusVariables: SystemVariable[] = [
  {
    id: 'design_not_started',
    name: 'Not Started',
    displayName: 'Chưa bắt đầu',
    color: '#6b7280',
    category: 'design',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'design_waiting',
    name: 'Waiting',
    displayName: 'Chờ xử lý',
    color: '#ef4444',
    category: 'design',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'design_blend',
    name: 'Blend: Work in Progress',
    displayName: 'Blend',
    color: '#f97316',
    category: 'design',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'design_retouch',
    name: 'Retouch: Work in Progress',
    displayName: 'Retouch',
    color: '#eab308',
    category: 'design',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'design_video',
    name: 'Video: Work in Progress',
    displayName: 'Video',
    color: '#8b5cf6',
    category: 'design',
    type: 'status',
    editable: true,
    required: true
  },
  {
    id: 'design_done',
    name: 'Done/Archived',
    displayName: 'Hoàn thành',
    color: '#10b981',
    category: 'design',
    type: 'status',
    editable: true,
    required: true
  }
];

// Staff Role Variables
export const staffRoleVariables: SystemVariable[] = [
  {
    id: 'staff_photographer',
    name: 'Photographer',
    displayName: 'Photographer',
    color: '#3b82f6',
    icon: 'Camera',
    category: 'staff',
    type: 'role',
    editable: true,
    required: false
  },
  {
    id: 'staff_editor',
    name: 'Editor',
    displayName: 'Editor',
    color: '#8b5cf6',
    icon: 'Palette',
    category: 'staff',
    type: 'role',
    editable: true,
    required: false
  },
  {
    id: 'staff_assistant',
    name: 'Assistant',
    displayName: 'Assistant',
    color: '#6b7280',
    icon: 'User',
    category: 'staff',
    type: 'role',
    editable: true,
    required: false
  },
  {
    id: 'staff_manager',
    name: 'Manager',
    displayName: 'Manager',
    color: '#dc2626',
    icon: 'Shield',
    category: 'staff',
    type: 'role',
    editable: true,
    required: false
  }
];

// Staff Names Variables
export const staffNameVariables: SystemVariable[] = [
  {
    id: 'staff_dat',
    name: 'Đạt',
    displayName: 'Đạt',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_an',
    name: 'An',
    displayName: 'An',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_huy',
    name: 'Huy',
    displayName: 'Huy',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_huy_lon',
    name: 'Huy Lớn',
    displayName: 'Huy Lớn',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_phuc',
    name: 'A Phúc',
    displayName: 'A Phúc',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_long',
    name: 'Long',
    displayName: 'Long',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_lai',
    name: 'Lai',
    displayName: 'Lai',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_the_anh',
    name: 'Thế Anh',
    displayName: 'Thế Anh',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  },
  {
    id: 'staff_hoa',
    name: 'Hoa',
    displayName: 'Hoa',
    category: 'staff',
    type: 'field',
    editable: true,
    required: false
  }
];

// Equipment Category Variables
export const equipmentCategoryVariables: SystemVariable[] = [
  {
    id: 'equipment_camera',
    name: 'Camera',
    displayName: 'Camera',
    category: 'equipment',
    type: 'category',
    editable: true,
    required: false
  },
  {
    id: 'equipment_lens',
    name: 'Lens',
    displayName: 'Lens',
    category: 'equipment',
    type: 'category',
    editable: true,
    required: false
  },
  {
    id: 'equipment_lighting',
    name: 'Lighting',
    displayName: 'Lighting',
    category: 'equipment',
    type: 'category',
    editable: true,
    required: false
  },
  {
    id: 'equipment_tripod',
    name: 'Tripod',
    displayName: 'Tripod',
    category: 'equipment',
    type: 'category',
    editable: true,
    required: false
  },
  {
    id: 'equipment_audio',
    name: 'Audio',
    displayName: 'Audio',
    category: 'equipment',
    type: 'category',
    editable: true,
    required: false
  }
];

// Finance Category Variables - Updated per requirements
export const financeExpenseCategoryVariables: SystemVariable[] = [
  {
    id: 'expense_rent',
    name: 'Thuê mặt bằng',
    displayName: 'Thuê mặt bằng',
    category: 'finance_expense',
    type: 'category',
    editable: true,
    required: false,
    description: 'Chi phí thuê văn phòng, studio'
  },
  {
    id: 'expense_utilities',
    name: 'Điện nước',
    displayName: 'Điện nước',
    category: 'finance_expense',
    type: 'category',
    editable: true,
    required: false,
    description: 'Chi phí điện, nước, gas'
  },
  {
    id: 'expense_internet',
    name: 'Internet',
    displayName: 'Internet',
    category: 'finance_expense',
    type: 'category',
    editable: true,
    required: false,
    description: 'Chi phí internet, viễn thông'
  },
  {
    id: 'expense_insurance',
    name: 'Bảo hiểm',
    displayName: 'Bảo hiểm',
    category: 'finance_expense',
    type: 'category',
    editable: true,
    required: false,
    description: 'Bảo hiểm thiết bị, trách nhiệm'
  },
  {
    id: 'expense_tax',
    name: 'Thuế',
    displayName: 'Thuế',
    category: 'finance_expense',
    type: 'category',
    editable: true,
    required: false,
    description: 'Các loại thuế phải nộp'
  }
];

export const financeWishlistCategoryVariables: SystemVariable[] = [
  {
    id: 'wishlist_equipment',
    name: 'Thiết bị mới',
    displayName: 'Thiết bị mới',
    category: 'finance_wishlist',
    type: 'category',
    editable: true,
    required: false,
    description: 'Mua sắm thiết bị mới'
  },
  {
    id: 'wishlist_studio_upgrade',
    name: 'Nâng cấp studio',
    displayName: 'Nâng cấp studio',
    category: 'finance_wishlist',
    type: 'category',
    editable: true,
    required: false,
    description: 'Cải tạo, nâng cấp không gian'
  },
  {
    id: 'wishlist_courses',
    name: 'Khóa học',
    displayName: 'Khóa học',
    category: 'finance_wishlist',
    type: 'category',
    editable: true,
    required: false,
    description: 'Đào tạo, học tập'
  },
  {
    id: 'wishlist_marketing',
    name: 'Marketing',
    displayName: 'Marketing',
    category: 'finance_wishlist',
    type: 'category',
    editable: true,
    required: false,
    description: 'Quảng cáo, marketing'
  },
  {
    id: 'wishlist_travel',
    name: 'Du lịch',
    displayName: 'Du lịch',
    category: 'finance_wishlist',
    type: 'category',
    editable: true,
    required: false,
    description: 'Du lịch, nghỉ dưỡng'
  }
];

export const financeExternalIncomeCategoryVariables: SystemVariable[] = [
  {
    id: 'external_income_equipment_rental',
    name: 'Cho thuê thiết bị',
    displayName: 'Cho thuê thiết bị',
    category: 'finance_external_income',
    type: 'category',
    editable: true,
    required: false,
    description: 'Thu nhập từ cho thuê thiết bị'
  },
  {
    id: 'external_income_courses',
    name: 'Khóa học',
    displayName: 'Khóa học',
    category: 'finance_external_income',
    type: 'category',
    editable: true,
    required: false,
    description: 'Thu nhập từ giảng dạy'
  },
  {
    id: 'external_income_consulting',
    name: 'Tư vấn',
    displayName: 'Tư vấn',
    category: 'finance_external_income',
    type: 'category',
    editable: true,
    required: false,
    description: 'Thu nhập từ tư vấn'
  },
  {
    id: 'external_income_partnership',
    name: 'Hợp tác',
    displayName: 'Hợp tác',
    category: 'finance_external_income',
    type: 'category',
    editable: true,
    required: false,
    description: 'Thu nhập từ hợp tác'
  },
  {
    id: 'external_income_photo_sales',
    name: 'Bán ảnh',
    displayName: 'Bán ảnh',
    category: 'finance_external_income',
    type: 'category',
    editable: true,
    required: false,
    description: 'Thu nhập từ bán ảnh stock'
  }
];

// System Variable Categories - Updated per requirements
export const systemVariableCategories: SystemVariableCategory[] = [
  {
    id: 'shows_types',
    name: 'Loại hình Shows',
    description: 'Quản lý các loại hình chụp ảnh',
    icon: 'Camera',
    variables: showTypeVariables
  },
  {
    id: 'areas',
    name: 'Khu vực',
    description: 'Quản lý các khu vực hoạt động',
    icon: 'MapPin',
    variables: areaVariables
  },
  {
    id: 'workers',
    name: 'Số thợ',
    description: 'Cấu hình số lượng thợ',
    icon: 'Users',
    variables: workerCountVariables
  },
  {
    id: 'shows_status',
    name: 'Trạng thái Shows',
    description: 'Quản lý trạng thái và màu sắc shows',
    icon: 'Clock',
    variables: showStatusVariables
  },
  {
    id: 'design_status',
    name: 'Trạng thái Design',
    description: 'Quản lý workflow design',
    icon: 'Palette',
    variables: designStatusVariables
  },
  {
    id: 'finance_expense',
    name: 'Chi cố định',
    description: 'Danh mục chi phí cố định',
    icon: 'Database',
    variables: financeExpenseCategoryVariables
  },
  {
    id: 'finance_wishlist',
    name: 'Chi Wishlist',
    description: 'Danh mục chi tiêu mong muốn',
    icon: 'Star',
    variables: financeWishlistCategoryVariables
  },
  {
    id: 'finance_external_income',
    name: 'Thu ngoài',
    description: 'Danh mục thu nhập ngoài (không có nguồn thu)',
    icon: 'Plus',
    variables: financeExternalIncomeCategoryVariables
  }
];

// Helper functions
export const getVariableById = (id: string): SystemVariable | undefined => {
  for (const category of systemVariableCategories) {
    const variable = category.variables.find(v => v.id === id);
    if (variable) return variable;
  }
  return undefined;
};

export const getVariablesByCategory = (categoryId: string): SystemVariable[] => {
  const category = systemVariableCategories.find(c => c.id === categoryId);
  return category ? category.variables : [];
};

export const getVariablesByType = (type: SystemVariable['type']): SystemVariable[] => {
  const allVariables = systemVariableCategories.flatMap(c => c.variables);
  return allVariables.filter(v => v.type === type);
};

export const updateVariable = (id: string, updates: Partial<SystemVariable>): boolean => {
  for (const category of systemVariableCategories) {
    const variableIndex = category.variables.findIndex(v => v.id === id);
    if (variableIndex !== -1) {
      category.variables[variableIndex] = { ...category.variables[variableIndex], ...updates };
      return true;
    }
  }
  return false;
};

export const addVariable = (categoryId: string, variable: SystemVariable): boolean => {
  const category = systemVariableCategories.find(c => c.id === categoryId);
  if (category) {
    category.variables.push(variable);
    return true;
  }
  return false;
};

export const removeVariable = (id: string): boolean => {
  for (const category of systemVariableCategories) {
    const variableIndex = category.variables.findIndex(v => v.id === id);
    if (variableIndex !== -1 && !category.variables[variableIndex].required) {
      category.variables.splice(variableIndex, 1);
      return true;
    }
  }
  return false;
};

// Helper function to calculate deadline based on shoot date and show type
export const calculateDeadline = (shootDate: string, showType: string): string => {
  const typeVariable = showTypeVariables.find(v => v.name === showType);
  const deadlineDays = typeVariable?.deadlineDays || 7; // Default 7 days if not found
  
  const shootDateObj = new Date(shootDate);
  const deadlineDate = new Date(shootDateObj);
  deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);
  
  return deadlineDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Helper function to get deadline days for a show type
export const getDeadlineDaysForType = (showType: string): number => {
  const typeVariable = showTypeVariables.find(v => v.name === showType);
  return typeVariable?.deadlineDays || 7;
}; 