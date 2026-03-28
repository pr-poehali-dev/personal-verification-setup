import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, Employee } from '@/data/store';

interface LoginPageProps {
  onLogin: (employee: Employee) => void;
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
        em => em.identifier === identifier.trim() && em.password === password
      );
      if (!emp) {
        setError('Неверный идентификатор или пароль');
        setLoading(false);
        return;
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSmsCode(code);
      setPendingEmployee(emp);
      setStep('sms');
      setLoading(false);
    }, 600);
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

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(0,0%,95%)' }}>
      {/* Левая колонка — зелёная панель Сбер */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 text-white"
        style={{ background: 'linear-gradient(160deg, hsl(133,60%,22%) 0%, hsl(133,67%,30%) 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Icon name="Shield" size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-base">АС ЕФС СБОЛ.про</div>
            <div className="text-white/60 text-xs">Автоматизированная система</div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4">
            Банковская<br/>операционная<br/>система
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Защищённая платформа для операционистов и кассиров. Все операции — под контролем.
          </p>
          <div className="space-y-3">
            {[
              { icon: 'Lock', text: 'Двухфакторная аутентификация' },
              { icon: 'ShieldCheck', text: 'Шифрование TLS 1.3 · PCI DSS' },
              { icon: 'Eye', text: 'Логирование всех операций' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={14} className="text-white/80" />
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/30 text-xs">© 2025 АС ЕФС СБОЛ.про · Версия 2.5.1</div>
      </div>

      {/* Правая колонка — форма */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Лого на мобильных */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--primary))' }}>
              <Icon name="Shield" size={20} className="text-white" />
            </div>
            <div className="font-bold text-foreground">АС ЕФС СБОЛ.про</div>
          </div>

          {step === 'credentials' ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Добро пожаловать</h1>
              <p className="text-muted-foreground text-sm mb-7">Войдите в систему для продолжения работы</p>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">
                    Идентификатор
                  </label>
                  <div className="relative">
                    <Icon name="User" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      className="sber-input w-full pl-10"
                      placeholder="varikabank"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">
                    Пароль
                  </label>
                  <div className="relative">
                    <Icon name="KeyRound" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="sber-input w-full pl-10 pr-10"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={showPass ? 'EyeOff' : 'Eye'} size={15} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <Icon name="AlertCircle" size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-60 glow-green"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Loader2" size={16} className="animate-spin" /> Проверка...
                    </span>
                  ) : 'Войти в систему'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('credentials'); setError(''); setInputSms(''); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <Icon name="ArrowLeft" size={15} /> Назад
              </button>
              <h1 className="text-2xl font-bold text-foreground mb-1">Подтверждение</h1>
              <p className="text-muted-foreground text-sm mb-7">
                SMS-код отправлен на номер<br/>
                <span className="font-semibold text-foreground">{pendingEmployee?.name}</span>
              </p>

              <form onSubmit={handleSms} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">
                    6-значный код из SMS
                  </label>
                  <input
                    type="text"
                    value={inputSms}
                    onChange={e => setInputSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="sber-input w-full text-2xl text-center tracking-[0.6em] font-mono"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setInputSms(smsCode)}
                  className="text-xs text-primary hover:underline w-full text-center"
                >
                  Тестовый режим: вставить код автоматически
                </button>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <Icon name="AlertCircle" size={14} /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all glow-green"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  Подтвердить и войти
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            Защищённое соединение · TLS 1.3 · PCI DSS
          </p>
        </div>
      </div>
    </div>
  );
}
