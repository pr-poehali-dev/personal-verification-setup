import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, Employee } from '@/data/store';

interface LoginPageProps {
  onLogin: (employee: Employee, smsCode?: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'sms'>('credentials');
  const [smsCode, setSmsCode] = useState('');
  const [inputSms, setInputSms] = useState('');
  const [error, setError] = useState('');
  const [pendingEmployee, setPendingEmployee] = useState<Employee | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const data = loadData();
      const emp = data.employees.find(
        e => e.identifier === identifier.trim() && e.password === password
      );
      if (!emp) {
        setError('Неверный идентификатор или пароль');
        setLoading(false);
        return;
      }
      // Generate 6-digit SMS code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSmsCode(code);
      setPendingEmployee(emp);
      setStep('sms');
      setLoading(false);
      // In real system — send via SMS. Here show in console / toast
      console.log(`[SMS 2FA] Код для ${emp.name}: ${code}`);
    }, 800);
  };

  const handleSms = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (inputSms.trim() === smsCode) {
      onLogin(pendingEmployee!);
    } else {
      setError('Неверный SMS-код. Попробуйте ещё раз.');
    }
  };

  const devFillCode = () => setInputSms(smsCode);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(hsl(145,63%,42%) 1px, transparent 1px), linear-gradient(90deg, hsl(145,63%,42%) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, hsl(145,63%,42%) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 glow-green"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,48%))' }}>
            <Icon name="Shield" size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">АС ЕФС СБОЛ.про</h1>
          <p className="text-muted-foreground text-sm mt-1">Автоматизированная система единой финансовой службы</p>
        </div>

        {/* Card */}
        <div className="sber-card p-8 animate-scale-in">
          {/* Security badge */}
          <div className="flex items-center gap-2 mb-6 p-3 rounded-lg" style={{ background: 'hsla(145,63%,42%,0.1)', border: '1px solid hsla(145,63%,42%,0.2)' }}>
            <Icon name="Lock" size={14} className="text-primary" />
            <span className="text-xs text-primary font-medium">Защищённое соединение · TLS 1.3 · PCI DSS</span>
          </div>

          {step === 'credentials' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Вход в систему</h2>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Идентификатор сотрудника</label>
                  <div className="relative">
                    <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="varikabank"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Пароль</label>
                  <div className="relative">
                    <Icon name="KeyRound" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg py-2.5 pl-9 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                      <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <Icon name="AlertCircle" size={14} />
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60 glow-green-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Loader2" size={16} className="animate-spin" /> Проверка...
                    </span>
                  ) : 'Войти'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setStep('credentials'); setError(''); }} className="text-muted-foreground hover:text-white transition-colors">
                  <Icon name="ArrowLeft" size={18} />
                </button>
                <h2 className="text-xl font-semibold text-white">Подтверждение входа</h2>
              </div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
                  <Icon name="MessageSquare" size={24} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">SMS-код отправлен на номер сотрудника</p>
                <p className="text-white font-medium mt-1">{pendingEmployee?.name}</p>
              </div>
              <form onSubmit={handleSms} className="space-y-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">6-значный код из SMS</label>
                  <input
                    type="text"
                    value={inputSms}
                    onChange={e => setInputSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-white text-xl text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                {/* Dev mode hint */}
                <button type="button" onClick={devFillCode} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors underline">
                  Тестовый режим: вставить код автоматически
                </button>
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <Icon name="AlertCircle" size={14} /> {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 glow-green-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}
                >
                  Подтвердить вход
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 АС ЕФС СБОЛ.про · Версия 2.5.1 · Все права защищены
        </p>
      </div>
    </div>
  );
}
