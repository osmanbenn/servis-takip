import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wrench, AlertTriangle, Lock } from 'lucide-react';
import { login } from '@/lib/store';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setLocation('/');
    } else {
      setError('Hatalı şifre');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2a4a73] to-[#0f2744] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 shadow-xl">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Osman Teknik</h1>
          <p className="text-blue-200/70 mt-2">Servis Yönetim Paneli</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl flex items-center gap-2 text-gray-900">
              <Lock className="w-5 h-5 text-[#1e3a5f]" />
              Giriş Yap
            </CardTitle>
            <CardDescription>
              Sisteme erişmek için şifrenizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  data-testid="input-password"
                  className="h-12 text-lg bg-gray-50 border-gray-200"
                  autoFocus
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-600 font-medium" data-testid="text-error">
                  {error}
                </p>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-[#1e3a5f] hover:bg-[#2a4a73]"
                data-testid="button-login"
              >
                Giriş Yap
              </Button>
            </form>

            <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700">Demo Modu</p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    Şifre: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">admin123</code>
                  </p>
                  <p className="text-amber-600/80 text-xs mt-1">
                    Üretimde güvenli kimlik doğrulama kullanılmalıdır.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}