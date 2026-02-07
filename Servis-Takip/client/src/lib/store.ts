import { ServiceRecord, StockItem, AppData, ServiceStatus, StatusChange } from './types';

const STORAGE_KEY = 'teknoservis_data';
const AUTH_KEY = 'teknoservis_auth';
const DEMO_PASSWORD = 'admin123';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getInitialData(): AppData {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();

  return {
    serviceRecords: [
      {
        id: generateId(),
        customerName: 'Ahmet Yılmaz',
        customerPhone: '0532 123 4567',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13 Pro',
        imei: '354789123456789',
        issueDescription: 'Ekran kırık, dokunmatik çalışmıyor',
        estimatedPrice: 3500,
        accessories: ['Şarj Kablosu', 'Kılıf'],
        deliveryDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        status: 'islemde',
        notes: ['Orijinal ekran sipariş edildi'],
        statusHistory: [
          { id: generateId(), status: 'beklemede', timestamp: threeDaysAgo },
          { id: generateId(), status: 'islemde', timestamp: yesterday, note: 'Ekran sipariş edildi' }
        ],
        createdAt: threeDaysAgo,
        updatedAt: yesterday
      },
      {
        id: generateId(),
        customerName: 'Fatma Demir',
        customerPhone: '0542 987 6543',
        deviceBrand: 'Samsung',
        deviceModel: 'Galaxy S23 Ultra',
        imei: '358765432198765',
        issueDescription: 'Batarya şişmiş, hızlı bitiyor',
        estimatedPrice: 1200,
        accessories: ['Kutu', 'Şarj Kablosu'],
        deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'hazir',
        notes: ['Batarya değiştirildi', 'Test edildi, sorunsuz çalışıyor'],
        statusHistory: [
          { id: generateId(), status: 'beklemede', timestamp: twoDaysAgo },
          { id: generateId(), status: 'islemde', timestamp: yesterday },
          { id: generateId(), status: 'hazir', timestamp: now, note: 'Batarya değişimi tamamlandı' }
        ],
        createdAt: twoDaysAgo,
        updatedAt: now
      },
      {
        id: generateId(),
        customerName: 'Mehmet Kaya',
        customerPhone: '0555 456 7890',
        deviceBrand: 'Xiaomi',
        deviceModel: 'Redmi Note 12',
        imei: '352147896325874',
        issueDescription: 'Şarj soketi bozuk',
        estimatedPrice: 450,
        accessories: [],
        deliveryDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        status: 'parca-bekliyor',
        notes: ['Şarj soketi sipariş edildi, 2 gün içinde gelecek'],
        statusHistory: [
          { id: generateId(), status: 'beklemede', timestamp: yesterday },
          { id: generateId(), status: 'parca-bekliyor', timestamp: now, note: 'Parça sipariş edildi' }
        ],
        createdAt: yesterday,
        updatedAt: now
      },
      {
        id: generateId(),
        customerName: 'Ayşe Şahin',
        customerPhone: '0544 321 9876',
        deviceBrand: 'Huawei',
        deviceModel: 'P40 Lite',
        imei: '359874123698741',
        issueDescription: 'Kamera bulanık çekiyor',
        estimatedPrice: 800,
        accessories: ['Kılıf', 'Ekran Koruyucu'],
        deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        status: 'teslim-edildi',
        notes: ['Kamera modülü değiştirildi', 'Müşteriye teslim edildi'],
        statusHistory: [
          { id: generateId(), status: 'beklemede', timestamp: threeDaysAgo },
          { id: generateId(), status: 'islemde', timestamp: twoDaysAgo },
          { id: generateId(), status: 'hazir', timestamp: yesterday },
          { id: generateId(), status: 'teslim-edildi', timestamp: now }
        ],
        createdAt: threeDaysAgo,
        updatedAt: now
      },
      {
        id: generateId(),
        customerName: 'Ali Öztürk',
        customerPhone: '0533 789 4561',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 12',
        imei: '351478963214785',
        issueDescription: 'Face ID çalışmıyor',
        estimatedPrice: 2800,
        accessories: ['Şarj Kablosu', 'Kulaklık'],
        deliveryDate: new Date(Date.now() + 345600000).toISOString().split('T')[0],
        status: 'beklemede',
        notes: [],
        statusHistory: [
          { id: generateId(), status: 'beklemede', timestamp: now }
        ],
        createdAt: now,
        updatedAt: now
      }
    ],
    stockItems: [
      { id: generateId(), name: 'iPhone Ekran (Orijinal)', quantity: 3, criticalLevel: 2, createdAt: now, updatedAt: now },
      { id: generateId(), name: 'Samsung Batarya (S23)', quantity: 5, criticalLevel: 3, createdAt: now, updatedAt: now },
      { id: generateId(), name: 'Şarj Soketi (Universal)', quantity: 12, criticalLevel: 5, createdAt: now, updatedAt: now },
      { id: generateId(), name: 'Xiaomi Ekran (Redmi)', quantity: 1, criticalLevel: 2, createdAt: now, updatedAt: now },
      { id: generateId(), name: 'iPhone Batarya (12/13)', quantity: 4, criticalLevel: 3, createdAt: now, updatedAt: now },
      { id: generateId(), name: 'Kamera Modülü (Universal)', quantity: 2, criticalLevel: 2, createdAt: now, updatedAt: now },
      { id: generateId(), name: 'Hoparlör (Universal)', quantity: 8, criticalLevel: 4, createdAt: now, updatedAt: now }
    ],
    lastUpdated: now
  };
}

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
  const initial = getInitialData();
  saveData(initial);
  return initial;
}

export function saveData(data: AppData): void {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppData;
    if (!data.serviceRecords || !data.stockItems) {
      throw new Error('Invalid data format');
    }
    saveData(data);
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}

export function addServiceRecord(record: Omit<ServiceRecord, 'id' | 'statusHistory' | 'createdAt' | 'updatedAt'>): ServiceRecord {
  const data = loadData();
  const now = new Date().toISOString();
  const newRecord: ServiceRecord = {
    ...record,
    id: generateId(),
    statusHistory: [{ id: generateId(), status: record.status, timestamp: now }],
    createdAt: now,
    updatedAt: now
  };
  data.serviceRecords.unshift(newRecord);
  saveData(data);
  return newRecord;
}

export function updateServiceRecord(id: string, updates: Partial<ServiceRecord>): ServiceRecord | null {
  const data = loadData();
  const index = data.serviceRecords.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  const record = data.serviceRecords[index];
  const updatedRecord = { ...record, ...updates, updatedAt: new Date().toISOString() };
  data.serviceRecords[index] = updatedRecord;
  saveData(data);
  return updatedRecord;
}

export function updateServiceStatus(id: string, status: ServiceStatus, note?: string): ServiceRecord | null {
  const data = loadData();
  const index = data.serviceRecords.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  const record = data.serviceRecords[index];
  const statusChange: StatusChange = {
    id: generateId(),
    status,
    timestamp: new Date().toISOString(),
    note
  };
  
  record.status = status;
  record.statusHistory.push(statusChange);
  record.updatedAt = new Date().toISOString();
  
  saveData(data);
  return record;
}

export function addNoteToRecord(id: string, note: string): ServiceRecord | null {
  const data = loadData();
  const index = data.serviceRecords.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  data.serviceRecords[index].notes.push(note);
  data.serviceRecords[index].updatedAt = new Date().toISOString();
  saveData(data);
  return data.serviceRecords[index];
}

export function deleteServiceRecord(id: string): boolean {
  const data = loadData();
  const index = data.serviceRecords.findIndex(r => r.id === id);
  if (index === -1) return false;
  
  data.serviceRecords.splice(index, 1);
  saveData(data);
  return true;
}

export function getServiceRecord(id: string): ServiceRecord | null {
  const data = loadData();
  return data.serviceRecords.find(r => r.id === id) || null;
}

export function addStockItem(item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): StockItem {
  const data = loadData();
  const now = new Date().toISOString();
  const newItem: StockItem = {
    ...item,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  };
  data.stockItems.push(newItem);
  saveData(data);
  return newItem;
}

export function updateStockItem(id: string, updates: Partial<StockItem>): StockItem | null {
  const data = loadData();
  const index = data.stockItems.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  data.stockItems[index] = { ...data.stockItems[index], ...updates, updatedAt: new Date().toISOString() };
  saveData(data);
  return data.stockItems[index];
}

export function deleteStockItem(id: string): boolean {
  const data = loadData();
  const index = data.stockItems.findIndex(i => i.id === id);
  if (index === -1) return false;
  
  data.stockItems.splice(index, 1);
  saveData(data);
  return true;
}

export function getLowStockItems(): StockItem[] {
  const data = loadData();
  return data.stockItems.filter(item => item.quantity <= item.criticalLevel);
}

export function checkAuth(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(password: string): boolean {
  if (password === DEMO_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}