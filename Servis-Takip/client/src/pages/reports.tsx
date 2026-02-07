import { useMemo } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, 
  Smartphone, Users, Package, Calendar, BarChart3
} from 'lucide-react';
import { loadData } from '@/lib/store';
import { STATUS_LABELS, ServiceStatus } from '@/lib/types';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function ReportsPage() {
  const data = loadData();

  const stats = useMemo(() => {
    const now = new Date();
    const today = { start: startOfDay(now), end: endOfDay(now) };
    const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
    
    const todayRecords = data.serviceRecords.filter(r => 
      isWithinInterval(new Date(r.createdAt), today)
    );
    
    const thisMonthRecords = data.serviceRecords.filter(r => 
      isWithinInterval(new Date(r.createdAt), thisMonth)
    );
    
    const todayRevenue = todayRecords.reduce((sum, r) => sum + r.estimatedPrice, 0);
    const monthlyRevenue = thisMonthRecords.reduce((sum, r) => sum + r.estimatedPrice, 0);
    const totalRevenue = data.serviceRecords.reduce((sum, r) => sum + r.estimatedPrice, 0);
    
    const completedRecords = data.serviceRecords.filter(r => r.status === 'teslim-edildi');
    const pendingRecords = data.serviceRecords.filter(r => 
      r.status === 'beklemede' || r.status === 'islemde' || r.status === 'parca-bekliyor'
    );
    
    const uniqueCustomers = new Set(data.serviceRecords.map(r => r.customerPhone)).size;
    
    const brandCounts: Record<string, number> = {};
    data.serviceRecords.forEach(r => {
      brandCounts[r.deviceBrand] = (brandCounts[r.deviceBrand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      totalRecords: data.serviceRecords.length,
      todayCount: todayRecords.length,
      todayRevenue,
      thisMonthRecords: thisMonthRecords.length,
      monthlyRevenue,
      totalRevenue,
      completedCount: completedRecords.length,
      pendingCount: pendingRecords.length,
      uniqueCustomers,
      topBrands,
      avgTicket: data.serviceRecords.length > 0 ? totalRevenue / data.serviceRecords.length : 0,
      lowStockCount: data.stockItems.filter(i => i.quantity <= i.criticalLevel).length,
      statusCounts: data.serviceRecords.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<ServiceStatus, number>)
    };
  }, [data]);

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-500 mt-1">İş performansınızı analiz edin</p>
        </div>

        {/* Daily Stats Highlight */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="shadow-sm border-blue-100 bg-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Günlük Kayıt Sayısı</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.todayCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-emerald-100 bg-emerald-50/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-600">Günlük Ciro</p>
                  <p className="text-3xl font-bold text-gray-900">₺{stats.todayRevenue.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Gelir</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₺{stats.totalRevenue.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Bu Ay</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₺{stats.monthlyRevenue.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ort. Fiş Tutarı</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ₺{stats.avgTicket.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Toplam Müşteri</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.uniqueCustomers}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status and Brand Stats */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Durum Dağılımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.entries(stats.statusCounts) as [ServiceStatus, number][]).map(([status, count]) => {
                const percentage = stats.totalRecords > 0 ? (count / stats.totalRecords) * 100 : 0;
                const colors: Record<ServiceStatus, string> = {
                  'beklemede': 'bg-yellow-400',
                  'islemde': 'bg-blue-400',
                  'parca-bekliyor': 'bg-orange-400',
                  'hazir': 'bg-green-400',
                  'teslim-edildi': 'bg-gray-400'
                };
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{STATUS_LABELS[status]}</span>
                      <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Popüler Markalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topBrands.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz veri yok</p>
              ) : (
                stats.topBrands.map(([brand, count], index) => {
                  const percentage = stats.totalRecords > 0 ? (count / stats.totalRecords) * 100 : 0;
                  return (
                    <div key={brand} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-sm font-bold text-[#1e3a5f]">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{brand}</span>
                          <span className="text-sm text-gray-500">{count} kayıt</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#1e3a5f]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tamamlanan</p>
                <p className="text-xl font-bold text-gray-900">{stats.completedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bekleyen</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Kayıt</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalRecords}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stats.lowStockCount > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Package className={`w-5 h-5 ${
                  stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Düşük Stok</p>
                <p className="text-xl font-bold text-gray-900">{stats.lowStockCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}