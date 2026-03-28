import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, generateCardNumber, Employee } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

interface CardsProps { employee: Employee; }

export default function Cards({ employee }: CardsProps) {
  const { toast } = useToast();
  const data = loadData();
  const [form, setForm] = useState({ passport: '', fullName: '', phone: '', cardNumber: generateCardNumber(), expiry: '', accountId: '' });
  const [step, setStep] = useState<'form' | 'sms' | 'done'>('form');
  const [smsCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [inputSms, setInputSms] = useState('');
  const [smsError, setSmsError] = useState('');
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const checkAccount = () => {
    const d = loadData();
    const acc = d.accounts.find(a => a.accountNumber === form.accountId.trim());
    setAccountNotFound(!acc);
  };

  const handleCreateAccount = () => {
    const d = loadData();
    const client = d.clients.find(c => c.passport === form.passport || c.fullName === form.fullName);
    if (!client) { toast({ title: 'Ошибка', description: 'Клиент не найден в базе', variant: 'destructive' }); return; }
    const newAcc = {
      id: generateId(), accountNumber: '40817810' + Math.floor(Math.random() * 999999999999).toString().padStart(12, '0'),
      clientId: client.id, clientName: client.fullName, balance: 0, currency: 'RUB',
      type: 'checking' as const, typeLabel: 'Текущий', status: 'active' as const, createdAt: new Date().toISOString().split('T')[0],
    };
    d.accounts.push(newAcc); client.accounts.push(newAcc.id); saveData(d);
    set('accountId', newAcc.accountNumber); setAccountNotFound(false); setShowCreateAccount(false);
    toast({ title: '✅ Счёт создан', description: newAcc.accountNumber });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passport || !form.fullName || !form.phone || !form.cardNumber || !form.expiry) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' }); return;
    }
    if (accountNotFound && form.accountId) { toast({ title: 'Ошибка', description: 'Счёт не найден', variant: 'destructive' }); return; }
    setStep('sms');
  };

  const handleSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSms !== smsCode) { setSmsError('Неверный код'); return; }
    const d = loadData();
    const client = d.clients.find(c => c.passport === form.passport);
    const acc = d.accounts.find(a => a.accountNumber === form.accountId.trim());
    const newCard = {
      id: generateId(), cardNumber: form.cardNumber, clientId: client?.id || '',
      clientName: form.fullName, accountId: acc?.id || '', expiryDate: form.expiry,
      status: 'active' as const, type: 'debit' as const, createdAt: new Date().toISOString().split('T')[0],
    };
    d.cards.push(newCard);
    if (client) client.cards.push(newCard.id);
    d.transactions.unshift({
      id: generateId(), type: 'card_issue', typeLabel: 'Выпуск карты',
      amount: 0, currency: 'RUB', clientId: client?.id || '', clientName: form.fullName,
      operatorId: employee.id, operatorName: employee.name,
      status: 'completed', date: new Date().toISOString(),
      description: `Выпуск карты ${form.cardNumber} для ${form.fullName}`,
    });
    saveData(d);
    toast({ title: '✅ Карта выпущена', description: `Карта ${form.cardNumber} оформлена для ${form.fullName}` });
    setStep('done');
  };

  const reset = () => {
    setForm({ passport: '', fullName: '', phone: '', cardNumber: generateCardNumber(), expiry: '', accountId: '' });
    setStep('form'); setInputSms(''); setSmsError(''); setAccountNotFound(false);
  };

  const allCards = data.cards;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(0,63%,50%,0.15)' }}>
          <Icon name="Wallet" size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Управление банковскими картами</h1>
          <p className="text-muted-foreground text-xs">Выпуск и учёт карт</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Выпустить новую карту</h2>
          {step === 'done' ? (
            <div className="sber-card p-6 text-center">
              <Icon name="CheckCircle2" size={32} className="text-primary mx-auto mb-3" />
              <h3 className="text-white font-bold mb-2">Карта выпущена</h3>
              <button onClick={reset} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'hsl(var(--primary))' }}>
                Выпустить ещё
              </button>
            </div>
          ) : step === 'sms' ? (
            <div className="sber-card p-5">
              <h3 className="text-white font-medium mb-4">Подтверждение выпуска карты</h3>
              <form onSubmit={handleSms} className="space-y-3">
                <input type="text" value={inputSms} onChange={e => setInputSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full sber-input text-xl text-center tracking-[0.5em] font-mono"
                  placeholder="000000" />
                <button type="button" onClick={() => setInputSms(smsCode)} className="text-xs text-muted-foreground hover:text-primary underline">
                  Тестовый режим: вставить код
                </button>
                {smsError && <p className="text-destructive text-sm">{smsError}</p>}
                <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold" style={{ background: 'hsl(var(--primary))' }}>
                  Подтвердить
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sber-card p-5 space-y-3">
              {[
                { key: 'passport', label: 'Номер паспорта', placeholder: '4520 123456' },
                { key: 'fullName', label: 'ФИО клиента', placeholder: 'Иванова Мария Сергеевна' },
                { key: 'phone', label: 'Номер телефона', placeholder: '+7 (916) 555-11-22' },
                { key: 'cardNumber', label: 'Номер карты', placeholder: '4276 0000 0000 0000' },
                { key: 'expiry', label: 'Срок действия', placeholder: 'MM/YY' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">{f.label}</label>
                  <input type="text" value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                    className="w-full sber-input"
                    placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Привязать к счёту</label>
                <div className="flex gap-2">
                  <input type="text" value={form.accountId} onChange={e => set('accountId', e.target.value)}
                    className="flex-1 sber-input font-mono"
                    placeholder="40817810..." />
                  <button type="button" onClick={checkAccount} className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground border border-border hover:bg-secondary transition-colors bg-white">
                    Проверить
                  </button>
                </div>
                {accountNotFound && (
                  <div className="mt-2">
                    <p className="text-yellow-400 text-xs">Счёт не найден</p>
                    <button type="button" onClick={() => setShowCreateAccount(true)} className="text-xs text-primary underline">+ Создать счёт</button>
                  </div>
                )}
              </div>
              {showCreateAccount && (
                <div className="p-3 rounded-lg" style={{ background: 'hsla(145,63%,42%,0.08)', border: '1px solid hsla(145,63%,42%,0.2)' }}>
                  <p className="text-xs text-muted-foreground mb-2">Создать счёт для клиента с паспортом {form.passport}</p>
                  <button type="button" onClick={handleCreateAccount} className="px-3 py-1.5 rounded text-white text-xs" style={{ background: 'hsl(var(--primary))' }}>
                    Создать и вернуться
                  </button>
                </div>
              )}
              <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold text-sm mt-2"
                style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
                Выпустить карту
              </button>
            </form>
          )}
        </div>

        <div>
          <h2 className="text-base font-semibold text-white mb-4">Карты в системе ({allCards.length})</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {allCards.length === 0 ? (
              <div className="sber-card p-6 text-center text-muted-foreground text-sm">Карт нет</div>
            ) : allCards.map(card => (
              <div key={card.id} className="sber-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, hsl(145,63%,35%), hsl(145,63%,45%))' }}>
                    VISA
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-mono">{card.cardNumber}</div>
                    <div className="text-muted-foreground text-xs">{card.clientName} · {card.expiryDate}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${card.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {card.status === 'active' ? 'Активна' : 'Заблокирована'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}