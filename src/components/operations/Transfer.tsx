import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, formatMoney, Account, Employee } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

interface TransferProps { employee: Employee; }

function downloadReceipt(from: Account, to: Account, amount: number, employee: Employee) {
  const date = new Date();
  const content = `
ЧЕК ПЕРЕВОДА
─────────────────────────────────────────────────
АС ЕФС СБОЛ.про v2.5.1
Дата: ${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU')}
Номер операции: ${generateId().toUpperCase()}
─────────────────────────────────────────────────
ТИП ОПЕРАЦИИ: ПЕРЕВОД СО СЧЁТА НА СЧЁТ

ОТПРАВИТЕЛЬ:
  ФИО: ${from.clientName}
  Счёт: ${from.accountNumber}

ПОЛУЧАТЕЛЬ:
  ФИО: ${to.clientName}
  Счёт: ${to.accountNumber}

СУММА: ${formatMoney(amount)}
КОМИССИЯ: 0,00 ₽
ИТОГО СПИСАНО: ${formatMoney(amount)}
─────────────────────────────────────────────────
Операцию выполнил: ${employee.name}
─────────────────────────────────────────────────
ДОКУМЕНТ ЯВЛЯЕТСЯ ПОДТВЕРЖДЕНИЕМ ОПЕРАЦИИ
`;
  const link = document.createElement('a');
  link.href = `data:text/plain;charset=utf-8,` + encodeURIComponent(content);
  link.download = `Чек_перевод_${Date.now()}.txt`;
  link.click();
}

export default function Transfer({ employee }: TransferProps) {
  const { toast } = useToast();
  const [fromAcc, setFromAcc] = useState('');
  const [toAcc, setToAcc] = useState('');
  const [amount, setAmount] = useState('');
  const [foundFrom, setFoundFrom] = useState<Account | null>(null);
  const [foundTo, setFoundTo] = useState<Account | null>(null);
  const [step, setStep] = useState<'form' | 'sms' | 'done'>('form');
  const [smsCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [inputSms, setInputSms] = useState('');
  const [smsError, setSmsError] = useState('');

  const search = (val: string, type: 'from' | 'to') => {
    const data = loadData();
    const acc = data.accounts.find(a => a.accountNumber === val.trim());
    if (type === 'from') setFoundFrom(acc || null);
    else setFoundTo(acc || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = parseFloat(amount);
    if (!foundFrom || !foundTo) { toast({ title: 'Ошибка', description: 'Укажите оба счёта', variant: 'destructive' }); return; }
    if (foundFrom.id === foundTo.id) { toast({ title: 'Ошибка', description: 'Счёта отправителя и получателя совпадают', variant: 'destructive' }); return; }
    if (isNaN(sum) || sum <= 0) { toast({ title: 'Ошибка', description: 'Введите корректную сумму', variant: 'destructive' }); return; }
    if (sum > foundFrom.balance) { toast({ title: 'Ошибка', description: 'Недостаточно средств', variant: 'destructive' }); return; }
    setStep('sms');
  };

  const handleSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSms !== smsCode) { setSmsError('Неверный код'); return; }
    const data = loadData();
    const sum = parseFloat(amount);
    const fi = data.accounts.findIndex(a => a.id === foundFrom!.id);
    const ti = data.accounts.findIndex(a => a.id === foundTo!.id);
    if (fi !== -1) data.accounts[fi].balance -= sum;
    if (ti !== -1) data.accounts[ti].balance += sum;
    data.transactions.unshift({
      id: generateId(), type: 'transfer', typeLabel: 'Перевод',
      amount: sum, currency: 'RUB',
      accountFrom: foundFrom!.accountNumber, accountTo: foundTo!.accountNumber,
      clientId: foundFrom!.clientId, clientName: foundFrom!.clientName,
      operatorId: employee.id, operatorName: employee.name,
      status: 'completed', date: new Date().toISOString(),
      description: `Перевод со счёта ${foundFrom!.accountNumber} на ${foundTo!.accountNumber}`,
    });
    saveData(data);
    downloadReceipt(foundFrom!, foundTo!, sum, employee);
    toast({ title: '✅ Перевод выполнен', description: `${formatMoney(sum)} переведено с ${foundFrom!.clientName}` });
    setStep('done');
  };

  const reset = () => {
    setFromAcc(''); setToAcc(''); setAmount('');
    setFoundFrom(null); setFoundTo(null);
    setStep('form'); setInputSms(''); setSmsError('');
  };

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(260,63%,55%,0.15)' }}>
          <Icon name="ArrowLeftRight" size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Перевод со счёта на счёт</h1>
          <p className="text-muted-foreground text-xs">С подтверждением по SMS · Скачать чек</p>
        </div>
      </div>

      {step === 'done' ? (
        <div className="sber-card p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
            <Icon name="CheckCircle2" size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Перевод выполнен</h2>
          <p className="text-muted-foreground mb-6">Чек скачан автоматически</p>
          <button onClick={reset} className="px-6 py-2.5 rounded-lg text-white font-medium" style={{ background: 'hsl(var(--primary))' }}>
            Новый перевод
          </button>
        </div>
      ) : step === 'sms' ? (
        <div className="sber-card p-8">
          <h2 className="text-lg font-bold text-white mb-4">Подтверждение перевода</h2>
          <div className="p-4 rounded-lg mb-6" style={{ background: 'hsla(145,63%,42%,0.08)', border: '1px solid hsla(145,63%,42%,0.2)' }}>
            <div className="text-sm text-muted-foreground">Сумма перевода</div>
            <div className="text-2xl font-bold text-primary font-mono">{formatMoney(parseFloat(amount))}</div>
            <div className="text-xs text-muted-foreground mt-2">{foundFrom?.clientName} → {foundTo?.clientName}</div>
          </div>
          <form onSubmit={handleSms} className="space-y-4">
            <input
              type="text" value={inputSms}
              onChange={e => setInputSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-white text-xl text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="000000"
            />
            <button type="button" onClick={() => setInputSms(smsCode)} className="text-xs text-muted-foreground hover:text-primary underline">
              Тестовый режим: вставить код
            </button>
            {smsError && <p className="text-destructive text-sm">{smsError}</p>}
            <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold" style={{ background: 'hsl(var(--primary))' }}>
              Подтвердить перевод
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sber-card p-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Счёт отправителя</label>
              <div className="flex gap-2">
                <input type="text" value={fromAcc} onChange={e => setFromAcc(e.target.value)}
                  className="flex-1 bg-secondary border border-border rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="40817810000000000001" />
                <button type="button" onClick={() => search(fromAcc, 'from')} className="px-4 py-2.5 rounded-lg text-sm text-white" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>Найти</button>
              </div>
              {foundFrom && <div className="mt-2 text-xs text-primary">{foundFrom.clientName} · Баланс: {formatMoney(foundFrom.balance)}</div>}
              {!foundFrom && fromAcc && <div className="mt-2 text-xs text-destructive">Счёт не найден</div>}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Счёт получателя</label>
              <div className="flex gap-2">
                <input type="text" value={toAcc} onChange={e => setToAcc(e.target.value)}
                  className="flex-1 bg-secondary border border-border rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="40817810000000000003" />
                <button type="button" onClick={() => search(toAcc, 'to')} className="px-4 py-2.5 rounded-lg text-sm text-white" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>Найти</button>
              </div>
              {foundTo && <div className="mt-2 text-xs text-primary">{foundTo.clientName} · {foundTo.accountNumber}</div>}
              {!foundTo && toAcc && <div className="mt-2 text-xs text-destructive">Счёт не найден</div>}
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Сумма перевода (руб.)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                placeholder="0.00" min="1" step="0.01" />
            </div>
          </div>
          <button type="submit" disabled={!foundFrom || !foundTo || !amount}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
            Выполнить перевод
          </button>
        </form>
      )}
    </div>
  );
}
