import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, User, ChevronRight, Smartphone } from 'lucide-react';
import { loadData } from '@/lib/store';

interface Customer {
  name: string;
  phone: string;
  recordCount: number;
  totalSpent: number;
  lastVisit: string;
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const data = loadData();

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();
    
    data.serviceRecords.forEach(record => {
      const key = record.customerPhone;
      if (customerMap.has(key)) {
        const existing = customerMap.get(key)!;
        existing.recordCount++;
        existing.totalSpent += record.estimatedPrice;
        if (new Date(record.createdAt) > new Date(existing.lastVisit)) {
          existing.lastVisit = record.createdAt;
        }
      } else {
        customerMap.set(key, {
          name: record.customerName,
          phone: record.customerPhone,
          recordCount: 1,
          totalSpent: record.estimatedPrice,
          lastVisit: record.createdAt
        });
      }
    });
    
    return Array.from(customerMap.values()).sort((a, b) => 
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  }, [data.serviceRecords]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Müşteriler</h1>
          <p className="text-gray-500 mt-1">Toplam {customers.length} müşteri</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200 max-w-md"
            data-testid="input-search-customers"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Müşteri bulunamadı</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <Card 
                key={customer.phone} 
                className="shadow-sm hover:shadow-md transition-all cursor-pointer"
                data-testid={`card-customer-${customer.phone}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                      <a 
                        href={`tel:${customer.phone}`} 
                        className="text-sm text-[#1e3a5f] hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-gray-100">
                        <Smartphone className="w-3 h-3 mr-1" />
                        {customer.recordCount} kayıt
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-[#1e3a5f]">
                      ₺{customer.totalSpent.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}