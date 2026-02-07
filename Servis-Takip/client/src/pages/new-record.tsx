import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, User, Smartphone, FileText, Package } from 'lucide-react';
import { addServiceRecord } from '@/lib/store';
import { ServiceStatus, STATUS_LABELS, ACCESSORY_OPTIONS, PHONE_BRANDS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function NewRecordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    imei: '',
    issueDescription: '',
    estimatedPrice: '',
    accessories: [] as string[],
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'beklemede' as ServiceStatus,
    notes: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.deviceBrand || !formData.deviceModel) {
      toast({ title: 'Hata', description: 'Lütfen zorunlu alanları doldurun', variant: 'destructive' });
      return;
    }

    const record = addServiceRecord({
      ...formData,
      estimatedPrice: parseFloat(formData.estimatedPrice) || 0
    });

    toast({ title: 'Kayıt oluşturuldu', description: `${record.customerName} için yeni servis kaydı oluşturuldu.` });
    setLocation(`/kayit/${record.id}?print=true`);
  };

  const toggleAccessory = (accessory: string) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessory)
        ? prev.accessories.filter(a => a !== accessory)
        : [...prev.accessories, accessory]
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Servis Kaydı</h1>
            <p className="text-gray-500">Yeni bir tamir kaydı oluşturun</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5 text-[#1e3a5f]" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Müşteri Adı *</Label>
                <Input
                  id="customerName"
                  placeholder="Ahmet Yılmaz"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  data-testid="input-customer-name"
                  className="h-11 bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefon Numarası *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="0532 123 4567"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  data-testid="input-customer-phone"
                  className="h-11 bg-gray-50 border-gray-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                <Smartphone className="w-5 h-5 text-[#1e3a5f]" />
                Cihaz Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceBrand">Marka *</Label>
                  <Input
                    id="deviceBrand"
                    placeholder="Örn: Apple, Samsung..."
                    value={formData.deviceBrand}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceBrand: e.target.value }))}
                    data-testid="input-brand"
                    className="h-11 bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceModel">Model *</Label>
                  <Input
                    id="deviceModel"
                    placeholder="iPhone 13 Pro"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData(prev => ({ ...prev, deviceModel: e.target.value }))}
                    data-testid="input-model"
                    className="h-11 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imei">IMEI / Seri No</Label>
                <Input
                  id="imei"
                  placeholder="354789123456789"
                  value={formData.imei}
                  onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                  data-testid="input-imei"
                  className="h-11 bg-gray-50 border-gray-200 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                <FileText className="w-5 h-5 text-[#1e3a5f]" />
                Arıza ve Fiyat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue">Arıza Açıklaması *</Label>
                <Textarea
                  id="issue"
                  placeholder="Ekran kırık, dokunmatik çalışmıyor..."
                  value={formData.issueDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDescription: e.target.value }))}
                  data-testid="input-issue"
                  className="min-h-[100px] bg-gray-50 border-gray-200"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Tahmini Ücret (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="1500"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                    data-testid="input-price"
                    className="h-11 bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery">Alınan Teslim Tarihi</Label>
                  <Input
                    id="delivery"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    data-testid="input-delivery"
                    className="h-11 bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: ServiceStatus) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger data-testid="select-status" className="h-11 bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map(status => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                <Package className="w-5 h-5 text-[#1e3a5f]" />
                Alınan Aksesuarlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACCESSORY_OPTIONS.map(accessory => (
                  <label 
                    key={accessory}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.accessories.includes(accessory)
                        ? 'border-[#1e3a5f] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      checked={formData.accessories.includes(accessory)}
                      onCheckedChange={() => toggleAccessory(accessory)}
                      data-testid={`checkbox-${accessory}`}
                    />
                    <span className="text-sm">{accessory}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-[#1e3a5f] hover:bg-[#2a4a73]" 
            data-testid="button-save"
          >
            <Save className="w-5 h-5 mr-2" />
            Kaydı Oluştur
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}