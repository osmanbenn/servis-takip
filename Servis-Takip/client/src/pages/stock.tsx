import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle, Package, Plus, Minus, Edit2, Trash2, Search } from 'lucide-react';
import { loadData, addStockItem, updateStockItem, deleteStockItem } from '@/lib/store';
import { StockItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function StockPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(() => loadData().stockItems);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    criticalLevel: ''
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantity <= item.criticalLevel);

  const handleAdd = () => {
    if (!formData.name || !formData.quantity) {
      toast({ title: 'Hata', description: 'Lütfen gerekli alanları doldurun', variant: 'destructive' });
      return;
    }
    
    const newItem = addStockItem({
      name: formData.name,
      quantity: parseInt(formData.quantity) || 0,
      criticalLevel: parseInt(formData.criticalLevel) || 5
    });
    
    setItems(prev => [...prev, newItem]);
    setFormData({ name: '', quantity: '', criticalLevel: '' });
    setAddOpen(false);
    toast({ title: 'Parça eklendi' });
  };

  const handleEdit = () => {
    if (!editItem || !formData.name) return;
    
    const updated = updateStockItem(editItem.id, {
      name: formData.name,
      quantity: parseInt(formData.quantity) || 0,
      criticalLevel: parseInt(formData.criticalLevel) || 5
    });
    
    if (updated) {
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      toast({ title: 'Parça güncellendi' });
    }
    
    setEditItem(null);
    setFormData({ name: '', quantity: '', criticalLevel: '' });
  };

  const handleDelete = (id: string) => {
    deleteStockItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Parça silindi' });
  };

  const handleQuantityChange = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const newQuantity = Math.max(0, item.quantity + delta);
    const updated = updateStockItem(id, { quantity: newQuantity });
    
    if (updated) {
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
    }
  };

  const openEdit = (item: StockItem) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      criticalLevel: item.criticalLevel.toString()
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Stok Yönetimi</h1>
            <p className="text-gray-500 mt-1">Parça stoklarınızı takip edin</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-add-stock">
                <Plus className="w-4 h-4 mr-2" />
                Parça Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Parça Ekle</DialogTitle>
                <DialogDescription>Stok takibi için yeni parça ekleyin.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Parça Adı *</Label>
                  <Input
                    placeholder="iPhone Ekran (Orijinal)"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-stock-name"
                    className="bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Adet *</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      data-testid="input-stock-quantity"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kritik Seviye</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.criticalLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, criticalLevel: e.target.value }))}
                      data-testid="input-stock-critical"
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-confirm-add-stock">
                  Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {lowStockItems.length > 0 && (
          <Card className="border-red-200 bg-red-50 mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">Düşük Stok Uyarısı</p>
                  <p className="text-sm text-red-600 mt-1">
                    {lowStockItems.length} parça kritik seviyede veya altında.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {lowStockItems.map(item => (
                      <Badge key={item.id} variant="outline" className="bg-white border-red-200 text-red-700">
                        {item.name}: {item.quantity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Parça ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200 max-w-md"
            data-testid="input-search-stock"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Parça bulunamadı</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const isLow = item.quantity <= item.criticalLevel;
              const percentage = Math.min(100, (item.quantity / (item.criticalLevel * 3)) * 100);
              
              return (
                <Card 
                  key={item.id} 
                  className={`shadow-sm transition-all hover:shadow-md ${isLow ? 'border-red-200' : ''}`}
                  data-testid={`card-stock-${item.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                          {isLow && (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Kritik: {item.criticalLevel}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEdit(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(item.id)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isLow ? 'bg-red-400' : percentage > 60 ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span 
                        className={`text-2xl font-bold ${isLow ? 'text-red-500' : 'text-gray-900'}`}
                        data-testid={`text-quantity-${item.id}`}
                      >
                        {item.quantity}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parça Düzenle</DialogTitle>
            <DialogDescription>Stok bilgilerini güncelleyin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Parça Adı</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-edit-stock-name"
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Adet</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  data-testid="input-edit-stock-quantity"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Kritik Seviye</Label>
                <Input
                  type="number"
                  value={formData.criticalLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, criticalLevel: e.target.value }))}
                  data-testid="input-edit-stock-critical"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <Button onClick={handleEdit} className="w-full bg-[#1e3a5f] hover:bg-[#2a4a73]" data-testid="button-confirm-edit-stock">
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}