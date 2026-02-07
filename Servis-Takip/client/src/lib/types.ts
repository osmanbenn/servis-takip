export type ServiceStatus = 'beklemede' | 'islemde' | 'parca-bekliyor' | 'hazir' | 'teslim-edildi';

export interface StatusChange {
  id: string;
  status: ServiceStatus;
  timestamp: string;
  note?: string;
}

export interface ServiceRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string;
  issueDescription: string;
  estimatedPrice: number;
  accessories: string[];
  deliveryDate: string;
  status: ServiceStatus;
  notes: string[];
  statusHistory: StatusChange[];
  createdAt: string;
  updatedAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  criticalLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  serviceRecords: ServiceRecord[];
  stockItems: StockItem[];
  lastUpdated: string;
}

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  'beklemede': 'Beklemede',
  'islemde': 'İşlemde',
  'parca-bekliyor': 'Parça Bekliyor',
  'hazir': 'Hazır',
  'teslim-edildi': 'Teslim Edildi'
};

export const STATUS_COLORS: Record<ServiceStatus, string> = {
  'beklemede': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'islemde': 'bg-blue-100 text-blue-800 border-blue-200',
  'parca-bekliyor': 'bg-orange-100 text-orange-800 border-orange-200',
  'hazir': 'bg-green-100 text-green-800 border-green-200',
  'teslim-edildi': 'bg-gray-100 text-gray-800 border-gray-200'
};

export const ACCESSORY_OPTIONS = [
  'Şarj Kablosu',
  'Kulaklık',
  'Kılıf',
  'Ekran Koruyucu',
  'Hafıza Kartı',
  'SIM Kart',
  'Kutu',
  'Garanti Belgesi'
];

export const PHONE_BRANDS = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Huawei',
  'Oppo',
  'Vivo',
  'OnePlus',
  'Realme',
  'Google',
  'Sony',
  'LG',
  'Motorola',
  'Nokia',
  'Honor',
  'Diğer'
];