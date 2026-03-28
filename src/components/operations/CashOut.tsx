import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, formatMoney, Account, Employee } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

interface CashOutProps {
  employee: Employee;
}

function generateOkud0402009(account: Account, amount: number, employee: Employee): string {
  const date = new Date();
  const dateStr = date.toLocaleDateString('ru-RU');
  const timeStr = date.toLocaleTimeString('ru-RU');
  return `data:text/plain;charset=utf-8,` + encodeURIComponent(`
РАСХОДНЫЙ КАССОВЫЙ ОРДЕР
ФОРМА ПО ОКУД 0402009

Дата: ${dateStr} ${timeStr}
─────────────────────────────────────────────────
БАНК: АС ЕФС СБОЛ.про
БИК: 044525225
К/с: 30101810400000000225

ОПЕРАЦИЯ: ВЫДАЧА НАЛИЧНЫХ ДЕНЕГ
─────────────────────────────────────────────────
Номер документа: ${generateId().toUpperCase()}
Дата составления: ${dateStr}

ПОЛУЧАТЕЛЬ: ${account.clientName}
Счёт получателя: ${account.accountNumber}
Сумма: ${formatMoney(amount)}
Сумма прописью: ${amountToWords(amount)} рублей

Основание: Выдача наличных денег клиенту
─────────────────────────────────────────────────
Выдал операционист: ${employee.name}
Подпись: ___________________
Кассир: ___________________
Подпись: ___________________

Деньги получил: _______________ / ${account.clientName}
Подпись: ___________________
Дата: ${dateStr}
─────────────────────────────────────────────────
Документ сформирован АС ЕФС СБОЛ.про v2.5.1
  `);
}

function amountToWords(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

export default function CashOut({ employee }: CashOutProps) {
  const { toast } = useToast();
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [foundAccount, setFoundAccount] = useState<Account | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState<'form' | 'sms' | 'count' | 'done'>('form');
  const [smsCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [inputSms, setInputSms] = useState('');
  const [smsError, setSmsError] = useState('');

  const handleSearch = () => {
    const data = loadData();
    const acc = data.accounts.find(a => a.accountNumber === accountNumber.replace(/\s/g, '') || a.accountNumber === accountNumber);
    if (acc) { setFoundAccount(acc); setNotFound(false); }
    else { setFoundAccount(null); setNotFound(true); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundAccount) return;
    const sum = parseFloat(amount);
    if (isNaN(sum) || sum <= 0) { toast({ title: 'Ошибка', description: 'Введите корректную сумму', variant: 'destructive' }); return; }
    if (sum > foundAccount.balance) { toast({ title: 'Ошибка', description: 'Недостаточно средств на счёте', variant: 'destructive' }); return; }
    setStep('sms');
  };

  const handleSmsConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSms !== smsCode) { setSmsError('Неверный код'); return; }
    setStep('count');
  };

  const handleCountConfirm = () => {
    const data = loadData();
    const sum = parseFloat(amount);
    const accIdx = data.accounts.findIndex(a => a.id === foundAccount!.id);
    if (accIdx !== -1) data.accounts[accIdx].balance -= sum;
    data.transactions.unshift({
      id: generateId(),
      type: 'cash_out',
      typeLabel: 'Выдача наличных',
      amount: sum,
      currency: 'RUB',
      accountFrom: foundAccount!.accountNumber,
      clientId: foundAccount!.clientId,
      clientName: foundAccount!.clientName,
      operatorId: employee.id,
      operatorName: employee.name,
      status: 'completed',
      date: new Date().toISOString(),
      description: 'Выдача наличных по расходному ордеру',
      okudCode: '0402009',
    });
    saveData(data);
    // Download doc
    const link = document.createElement('a');
    link.href = generateOkud0402009(foundAccount!, sum, employee);
    link.download = `ОКУД_0402009_${Date.now()}.txt`;
    link.click();
    toast({ title: '✅ Операция выполнена', description: `Выдано ${formatMoney(sum)} клиенту ${foundAccount!.clientName}` });
    setStep('done');
  };

  const reset = () => {
    setAccountNumber(''); setAmount(''); setFoundAccount(null);
    setNotFound(false); setStep('form'); setInputSms(''); setSmsError('');
  };

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(0,63%,50%,0.15)' }}>
          <Icon name="ArrowDownCircle" size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Выдача наличных</h1>
          <p className="text-muted-foreground text-xs">Форма ОКУД 0402009</p>
        </div>
      </div>

      {step === 'done' ? (
        <div className="sber-card p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
            <Icon name="CheckCircle2" size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Операция выполнена</h2>
          <p className="text-muted-foreground mb-6">Документ ОКУД 0402009 скачан автоматически</p>
          <button onClick={reset} className="px-6 py-2.5 rounded-lg text-white font-medium" style={{ background: 'hsl(var(--primary))' }}>
            Новая операция
          </button>
        </div>
      ) : step === 'count' ? (
        <div className="sber-card p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-yellow-400" style={{ background: 'hsla(45,100%,50%,0.1)' }}>
            <Icon name="Banknote" size={32} className="text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Пересчитайте и выдайте деньги клиенту</h2>
          <p className="text-muted-foreground mb-2">Сумма к выдаче:</p>
          <p className="text-3xl font-bold text-primary font-mono mb-6">{formatMoney(parseFloat(amount))}</p>
          <p className="text-sm text-muted-foreground mb-6">Клиент: {foundAccount?.clientName}</p>
          <button onClick={handleCountConfirm} className="w-full py-3 rounded-lg text-white font-semibold" style={{ background: 'hsl(var(--primary))' }}>
            Деньги выданы · Подтвердить и скачать документ
          </button>
        </div>
      ) : step === 'sms' ? (
        <div className="sber-card p-8">
          <h2 className="text-lg font-bold text-white mb-2">Подтверждение операции</h2>
          <p className="text-muted-foreground text-sm mb-6">SMS-код отправлен клиенту {foundAccount?.clientName}</p>
          <form onSubmit={handleSmsConfirm} className="space-y-4">
            <input
              type="text"
              value={inputSms}
              onChange={e => setInputSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-secondary border border-border rounded-lg py-3 px-4 text-white text-xl text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="000000"
            />
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sber-card p-5 space-y-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Номер счёта клиента</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  className="flex-1 bg-secondary border border-border rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="40817810000000000001"
                />
                <button type="button" onClick={handleSearch} className="px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
                  Найти
                </button>
              </div>
            </div>

            {notFound && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <Icon name="AlertCircle" size={14} /> Счёт не найден в системе
              </div>
            )}

            {foundAccount && (
              <div className="p-3 rounded-lg border" style={{ background: 'hsla(145,63%,42%,0.08)', borderColor: 'hsla(145,63%,42%,0.3)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="CheckCircle2" size={14} className="text-primary" />
                  <span className="text-primary text-sm font-medium">Счёт найден</span>
                </div>
                <div className="text-white text-sm font-medium">{foundAccount.clientName}</div>
                <div className="text-muted-foreground text-xs font-mono">{foundAccount.accountNumber}</div>
                <div className="text-primary text-sm font-mono font-bold mt-1">Баланс: {formatMoney(foundAccount.balance)}</div>
              </div>
            )}

            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Сумма выдачи (руб.)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                placeholder="0.00"
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!foundAccount || !amount}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}
          >
            Выдать наличные · Отправить SMS-код клиенту
          </button>
        </form>
      )}
    </div>
  );
}
