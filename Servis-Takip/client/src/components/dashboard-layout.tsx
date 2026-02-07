import { ReactNode, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Wrench, ClipboardList, Plus, Users, Package, BarChart3, 
  LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/store';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', icon: ClipboardList, label: 'Tamir Kayıtları' },
  { href: '/yeni', icon: Plus, label: 'Yeni Kayıt' },
  { href: '/musteriler', icon: Users, label: 'Müşteriler' },
  { href: '/stok', icon: Package, label: 'Stok Yönetimi' },
  { href: '/raporlar', icon: BarChart3, label: 'Raporlar' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#1e3a5f] to-[#0f2744] flex-col fixed h-full z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Osman Teknik</h1>
              <p className="text-blue-200/60 text-xs">Servis Yönetim Paneli</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = location === href || (href !== '/' && location.startsWith(href));
              return (
                <li key={href}>
                  <Link href={href}>
                    <span
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-white/15 text-white shadow-lg shadow-black/10' 
                          : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                      }`}
                      data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-100/70 hover:text-white hover:bg-white/5"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1e3a5f] to-[#0f2744] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold">Osman Teknik</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-[#1e3a5f] to-[#0f2744] z-50 transform transition-transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Osman Teknik</h1>
              <p className="text-blue-200/60 text-xs">Servis Yönetim Paneli</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = location === href || (href !== '/' && location.startsWith(href));
              return (
                <li key={href}>
                  <Link href={href}>
                    <span
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-white/15 text-white' 
                          : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-blue-100/70 hover:text-white hover:bg-white/5"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}