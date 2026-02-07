import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Clock, CheckCircle2, Package, TrendingUp, 
  ChevronRight, Phone, Smartphone, AlertTriangle, Plus,
  Eye, Download, Upload, FileJson
} from 'lucide-react';
import { loadData, exportData, importData, getLowStockItems } from '@/lib/store';
import { ServiceRecord, STATUS_LABELS, STATUS_COLORS, ServiceStatus, PHONE_BRANDS } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [importJson, setImportJson] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const { toast } = useToast();

  const data = loadData();
  const records = data.serviceRecords;
  const lowStockItems = getLowStockItems();

  const stats = useMemo(() => {
    const devamEden = records.filter(r => r.status === 'islemde' || r.status === 'beklemede').length;
    const tamamlanan = records.filter(r => r.status === 'teslim-edildi').length;
    const parcaBekliyor = records.filter(r => r.status === 'parca-bekliyor').length;
    const aylikGelir = records
      .filter(r => {
        const date = new Date(r.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + r.estimatedPrice, 0);
    
    return { devamEden, tamamlanan, parcaBekliyor, aylikGelir };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchQuery === '' || 
        record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.customerPhone.includes(searchQuery) ||
        record.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.imei.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).slice(0, 10);
  }, [records, searchQuery, statusFilter]);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teknoservis-yedek-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Yedek oluşturuldu', description: 'Verileriniz JSON dosyası olarak indirildi.' });
  };

  const handleImport = () => {
    if (importData(importJson)) {
      toast({ title: 'Veriler yüklendi', description: 'Yedek dosyası başarıyla içe aktarıldı.' });
      setImportOpen(false);
      setImportJson('');
      window.location.reload();
    } else {
      toast({ title: 'Hata', description: 'Geçersiz dosya formatı', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Genel Bakış</h1>
            <p className="text-gray-500 mt-1">Osman Teknik servis yönetim paneli</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-import">
                  <Upload className="w-4 h-4 mr-2" />
                  İçe Aktar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yedek İçe Aktar</DialogTitle>
                  <DialogDescription>JSON formatındaki yedek dosyasının içeriğini yapıştırın</DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder='{"serviceRecords": [...], "stockItems": [...]}'
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="min-h-[200px] font-mono text-xs"
                  data-testid="input-import-json"
                />
                <Button onClick={handleImport} data-testid="button-confirm-import">
                  <FileJson className="w-4 h-4 mr-2" />
                  İçe Aktar
                </Button>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Dışa Aktar
            </Button>
            <Link href="/yeni">
              <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-new-record">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kayıt
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="bg-gradient-to-br from-amber-400 to-amber-500 border-0 text-white shadow-lg shadow-amber-200/50 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setStatusFilter('islemde')}
            data-testid="card-stat-ongoing"
          >
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Devam Eden</p>
                  <p className="text-3xl lg:text-4xl font-bold mt-1" data-testid="stat-ongoing">{stats.devamEden}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-emerald-400 to-emerald-500 border-0 text-white shadow-lg shadow-emerald-200/50 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setStatusFilter('teslim-edildi')}
            data-testid="card-stat-completed"
          >
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Tamamlandı</p>
                  <p className="text-3xl lg:text-4xl font-bold mt-1" data-testid="stat-completed">{stats.tamamlanan}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-400 to-orange-500 border-0 text-white shadow-lg shadow-orange-200/50 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setStatusFilter('parca-bekliyor')}
            data-testid="card-stat-waiting"
          >
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Parça Bekliyor</p>
                  <p className="text-3xl lg:text-4xl font-bold mt-1" data-testid="stat-waiting">{stats.parcaBekliyor}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Link href="/raporlar" className="block">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white shadow-lg shadow-blue-200/50 cursor-pointer hover:scale-[1.02] transition-transform h-full">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Aylık Gelir</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1" data-testid="stat-revenue">
                      ₺{stats.aylikGelir.toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Records Table */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-4 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Son Kayıtlar</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-gray-50 border-gray-200"
                        data-testid="input-search"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] h-9 bg-gray-50 border-gray-200" data-testid="select-status-filter">
                        <SelectValue placeholder="Durum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map(status => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Kayıt bulunamadı</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-t border-b bg-gray-50/50">
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">Müşteri</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden sm:table-cell whitespace-nowrap">Cihaz</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">Durum</th>
                          <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell whitespace-nowrap">Ücret</th>
                          <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 whitespace-nowrap">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredRecords.map(record => (
                          <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group" data-testid={`row-record-${record.id}`}>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900 group-hover:text-[#1e3a5f] transition-colors">{record.customerName}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {record.customerPhone}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{record.deviceBrand} {record.deviceModel}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className={`${STATUS_COLORS[record.status]} text-xs`}>
                                {STATUS_LABELS[record.status]}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="font-semibold text-gray-900">₺{record.estimatedPrice.toLocaleString('tr-TR')}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/kayit/${record.id}`}>
                                <Button variant="ghost" size="sm" className="text-[#1e3a5f] hover:text-[#2a4a73] hover:bg-blue-50">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Görüntüle
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {records.length > 10 && (
                  <div className="p-4 border-t text-center">
                    <Link href="/">
                      <Button variant="link" className="text-[#1e3a5f]">
                        Tüm kayıtları görüntüle
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Parts Status Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Parça Durumu</CardTitle>
                  <Link href="/stok">
                    <Button variant="ghost" size="sm" className="text-[#1e3a5f] hover:text-[#2a4a73]">
                      Tümü
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowStockItems.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6 animate-pulse">
                    <div className="flex items-center gap-3 text-red-600 font-bold">
                      <AlertTriangle className="w-6 h-6" />
                      <div>
                        <p className="text-sm">{lowStockItems.length} parça kritik seviyede!</p>
                        <p className="text-xs font-normal text-red-500">Lütfen stokları kontrol edin.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {data.stockItems.slice(0, 6).map(item => {
                  const isLow = item.quantity <= item.criticalLevel;
                  const percentage = Math.min(100, (item.quantity / (item.criticalLevel * 3)) * 100);
                  
                  return (
                    <div key={item.id} className="space-y-2" data-testid={`stock-item-${item.id}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 truncate flex-1">{item.name}</span>
                        <span className={`text-sm font-bold ${isLow ? 'text-red-500' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isLow ? 'bg-red-400' : percentage > 60 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/yeni">
                  <Button variant="outline" className="w-full justify-start h-11 border-dashed border-2 hover:border-[#1e3a5f] hover:text-[#1e3a5f]">
                    <Plus className="w-4 h-4 mr-3" />
                    Yeni Servis Kaydı
                  </Button>
                </Link>
                <Link href="/stok">
                  <Button variant="outline" className="w-full justify-start h-11">
                    <Package className="w-4 h-4 mr-3" />
                    Stok Güncelle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}