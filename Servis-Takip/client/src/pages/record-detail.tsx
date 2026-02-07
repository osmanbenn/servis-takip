import { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Phone, Smartphone, Calendar, Clock, User, Hash, 
  FileText, Package, CircleDot, Plus, Printer, Trash2, AlertTriangle,
  MessageSquare, RefreshCw, QrCode
} from 'lucide-react';
import { getServiceRecord, updateServiceStatus, addNoteToRecord, deleteServiceRecord } from '@/lib/store';
import { STATUS_LABELS, STATUS_COLORS, ServiceStatus } from '@/lib/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [record, setRecord] = useState(() => getServiceRecord(id || ''));
  const [newNote, setNewNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState<ServiceStatus | ''>('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('print') === 'true') {
      setTimeout(() => {
        window.print();
        // Temizleme: URL'den print parametresini kaldır
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 500);
    }
  }, []);

  if (!record) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center py-12">
          <p className="text-gray-500">Kayıt bulunamadı</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = () => {
    if (!newStatus) return;
    const updated = updateServiceStatus(record.id, newStatus, statusNote || undefined);
    if (updated) {
      setRecord(updated);
      toast({ title: 'Durum güncellendi', description: `Yeni durum: ${STATUS_LABELS[newStatus]}` });
    }
    setStatusDialogOpen(false);
    setNewStatus('');
    setStatusNote('');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updated = addNoteToRecord(record.id, newNote.trim());
    if (updated) {
      setRecord(updated);
      setNewNote('');
      toast({ title: 'Not eklendi' });
    }
  };

  const handleWhatsApp = () => {
    const message = `Merhaba ${record.customerName}, Osman Teknik'ten arıyoruz. ${record.deviceBrand} ${record.deviceModel} cihazınızın servis durumu: ${STATUS_LABELS[record.status]}. Detaylı bilgi için: ${window.location.origin}/kayit/${record.id}`;
    const encodedMessage = encodeURIComponent(message);
    const phone = record.customerPhone.replace(/\D/g, '');
    const finalPhone = phone.startsWith('0') ? `90${phone.slice(1)}` : phone;
    window.open(`https://wa.me/${finalPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleDelete = () => {
    deleteServiceRecord(record.id);
    toast({ title: 'Kayıt silindi' });
    setLocation('/');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-5xl" ref={printRef}>
        <div className="flex items-center justify-between mb-6 no-print">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kayıt Detayı</h1>
              <p className="text-gray-500">#{record.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleWhatsApp} className="text-green-600 border-green-200 hover:bg-green-50" data-testid="button-whatsapp">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
              <Printer className="w-4 h-4 mr-2" />
              Yazdır
            </Button>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" data-testid="button-delete">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Kaydı Sil
                  </DialogTitle>
                  <DialogDescription>Bu işlem geri alınamaz. Servis kaydı kalıcı olarak silinecek.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="flex-1">
                    İptal
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} className="flex-1" data-testid="button-confirm-delete">
                    Sil
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="print-only mb-8">
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Osman Teknik</h1>
              <p className="text-sm font-bold text-gray-600">Profesyonel Telefon Tamir Servisi</p>
              <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                <p>Adres: Merkez Mah. Cumhuriyet Cad. No:123</p>
                <p>Tel: 0500 000 00 00 | Web: osmantechnik.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gray-900 text-white px-3 py-1 text-xs font-bold rounded mb-1">TESLİM ALMA FİŞİ</div>
              <p className="text-[10px] font-mono text-gray-500">Fiş No: #{record.id.slice(-8).toUpperCase()}</p>
              <p className="text-[10px] text-gray-500">{format(new Date(record.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-xs mb-6">
            <div className="space-y-4">
              <section>
                <h3 className="font-bold border-b border-gray-200 pb-1 mb-2 uppercase text-[10px] text-gray-500">Müşteri Bilgileri</h3>
                <p className="font-bold text-sm">{record.customerName}</p>
                <p>{record.customerPhone}</p>
              </section>
              <section>
                <h3 className="font-bold border-b border-gray-200 pb-1 mb-2 uppercase text-[10px] text-gray-500">Cihaz Bilgileri</h3>
                <p className="font-bold">{record.deviceBrand} {record.deviceModel}</p>
                <p className="font-mono text-[10px]">IMEI: {record.imei || 'Belirtilmedi'}</p>
              </section>
            </div>
            <div className="space-y-4">
                  <section>
                    <h3 className="font-bold border-b border-gray-200 pb-1 mb-2 uppercase text-[10px] text-gray-500">Arıza & İşlem</h3>
                    <p className="italic">"{record.issueDescription}"</p>
                    <div className="mt-2 space-y-1">
                      <p className="flex justify-between"><span>Tahmini Ücret:</span> <span className="font-bold">₺{record.estimatedPrice.toLocaleString('tr-TR')}</span></p>
                      <p className="flex justify-between"><span>Alınan Teslim Tarihi:</span> <span className="font-bold">{record.deliveryDate ? format(new Date(record.deliveryDate), 'dd.MM.yyyy') : '-'}</span></p>
                    </div>
                  </section>
              {record.accessories.length > 0 && (
                <section>
                  <h3 className="font-bold border-b border-gray-200 pb-1 mb-2 uppercase text-[10px] text-gray-500">Alınan Aksesuarlar</h3>
                  <p className="text-[10px]">{record.accessories.join(', ')}</p>
                </section>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[9px] text-gray-600 mb-8 leading-relaxed">
            <p className="font-bold mb-1 uppercase">Şartlar ve Koşullar:</p>
            <ul className="list-disc pl-3 space-y-0.5">
              <li>Cihaz teslimi sadece bu fiş ile yapılır. Fişin kaybedilmesinden firmamız sorumlu değildir.</li>
              <li>30 gün içinde teslim alınmayan cihazlardan firmamız sorumlu değildir.</li>
              <li>Sıvı teması ve darbe görmüş cihazlarda onarım sonrası oluşabilecek arızalardan sorumluluk kabul edilmez.</li>
              <li>Yedekleme sorumluluğu müşteriye aittir, veri kaybından firmamız sorumlu tutulamaz.</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-12 mt-12 px-4">
            <div className="text-center">
              <div className="border-b border-gray-300 h-16 mb-2"></div>
              <p className="text-[10px] font-bold">Müşteri İmzası</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 h-16 mb-2 flex items-end justify-center pb-2">
                <QrCode className="w-12 h-12 text-gray-200" />
              </div>
              <p className="text-[10px] font-bold">Servis Kaşe/İmza</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-[#1e3a5f]" />
                    Müşteri Bilgileri
                  </CardTitle>
                  <Badge variant="outline" className={`${STATUS_COLORS[record.status]} px-3 py-1`}>
                    {STATUS_LABELS[record.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900" data-testid="text-customer-name">{record.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${record.customerPhone}`} className="text-[#1e3a5f] hover:underline" data-testid="text-customer-phone">
                    {record.customerPhone}
                  </a>
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900" data-testid="text-device">{record.deviceBrand} {record.deviceModel}</span>
                </div>
                {record.imei && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm text-gray-600" data-testid="text-imei">{record.imei}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-700" data-testid="text-issue">{record.issueDescription}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                  <Package className="w-5 h-5 text-[#1e3a5f]" />
                  Ücret ve Teslimat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Tahmini Ücret</span>
                  <span className="font-bold text-xl text-[#1e3a5f]" data-testid="text-price">
                    ₺{record.estimatedPrice.toLocaleString('tr-TR')}
                  </span>
                </div>
                {record.deliveryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Alınan Teslim Tarihi</span>
                    <span className="flex items-center gap-2 text-gray-900" data-testid="text-delivery">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(record.deliveryDate), 'd MMMM yyyy', { locale: tr })}
                    </span>
                  </div>
                )}
                {record.accessories.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-gray-500">Alınan Aksesuarlar:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {record.accessories.map(acc => (
                          <Badge key={acc} variant="secondary" className="bg-gray-100 text-gray-700">
                            {acc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm no-print">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                  <MessageSquare className="w-5 h-5 text-[#1e3a5f]" />
                  Notlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {record.notes.length > 0 && (
                  <div className="space-y-2">
                    {record.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
                        {note}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Yeni not ekle..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    data-testid="input-new-note"
                    className="flex-1 bg-gray-50 border-gray-200"
                  />
                  <Button onClick={handleAddNote} className="bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-add-note">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm no-print">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                  <RefreshCw className="w-5 h-5 text-[#1e3a5f]" />
                  Durum Güncelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-update-status">
                      Durumu Değiştir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Durumu Güncelle</DialogTitle>
                      <DialogDescription>Servis kaydının durumunu değiştirin ve not ekleyin.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Select value={newStatus} onValueChange={(v: ServiceStatus) => setNewStatus(v)}>
                        <SelectTrigger data-testid="select-new-status">
                          <SelectValue placeholder="Yeni durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map(status => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Durum notu (opsiyonel)"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        data-testid="input-status-note"
                      />
                      <Button onClick={handleStatusChange} disabled={!newStatus} className="w-full bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-confirm-status">
                        Güncelle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                  <Clock className="w-5 h-5 text-[#1e3a5f]" />
                  Zaman Çizelgesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...record.statusHistory].reverse().map((change, index) => (
                    <div key={change.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <CircleDot className={`w-4 h-4 ${index === 0 ? 'text-[#1e3a5f]' : 'text-gray-300'}`} />
                        {index < record.statusHistory.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`${STATUS_COLORS[change.status]} text-xs`}>
                            {STATUS_LABELS[change.status]}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {format(new Date(change.timestamp), 'd MMM HH:mm', { locale: tr })}
                          </span>
                        </div>
                        {change.note && (
                          <p className="text-sm text-gray-500 mt-1">{change.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <CircleDot className="w-4 h-4 text-gray-300" />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Kayıt Oluşturuldu</span>
                      <p className="text-xs text-gray-400">
                        {format(new Date(record.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="print-only mt-8 pt-4 border-t text-center text-xs text-gray-400">
          <p>Bu belge Osman Teknik tarafından oluşturulmuştur.</p>
          <p>Kayıt ID: {record.id}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}