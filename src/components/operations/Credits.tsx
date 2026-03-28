import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, formatMoney, Employee } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

interface CreditsProps { employee: Employee; }

function downloadCreditReceipt(form: Record<string, string>, employee: Employee, creditId: string) {
  const date = new Date();
  const content = `
ЧЕК ВЫДАЧИ КРЕДИТА / РАССРОЧКИ
─────────────────────────────────────────────────
АС ЕФС СБОЛ.про v2.5.1
Дата: ${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU')}
Номер кредитного договора: ${creditId.toUpperCase()}
─────────────────────────────────────────────────
ТИП: ${form.type === 'credit' ? 'КРЕДИТ' : 'РАССРОЧКА'}

ЗАЁМЩИК:
  ФИО: ${form.fullName}
  Паспорт: ${form.passport}

УСЛОВИЯ:
  Сумма: ${formatMoney(parseFloat(form.amount))}
  Срок: ${form.term} мес.
  Ставка: ${form.type === 'credit' ? '14,9% годовых' : '0% (рассрочка)'}
  Ежемесячный платёж: ${formatMoney(parseFloat(form.amount) / parseInt(form.term))}

Счёт/карта зачисления: ${form.accountId}
Дата окончания: ${form.endDate}
─────────────────────────────────────────────────
Кредитный менеджер: ${employee.name}
Подпись клиента: ___________________
─────────────────────────────────────────────────
КРЕДИТ ОДОБРЕН И ЗАЧИСЛЕН НА СЧЁТ
`;
  const link = document.createElement('a');
  link.href = `data:text/plain;charset=utf-8,` + encodeURIComponent(content);
  link.download = `Чек_кредит_${Date.now()}.txt`;
  link.click();
}

export default function Credits({ employee }: CreditsProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ type: 'credit', passport: '', fullName: '', accountId: '', amount: '', term: '12', endDate: '' });
  const [step, setStep] = useState<'form' | 'sms' | 'done'>('form');
  const [smsCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [inputSms, setInputSms] = useState('');
  const [smsError, setSmsError] = useState('');
  const [accountNotFound, setAccountNotFound] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccClientId, setNewAccClientId] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const checkAccount = () => {
    const data = loadData();
    const acc = data.accounts.find(a => a.accountNumber === form.accountId.trim());
    if (!acc) { setAccountNotFound(true); } else { setAccountNotFound(false); }
  };

  const handleCreateAccount = () => {
    const data = loadData();
    const client = data.clients.find(c => c.id === newAccClientId || c.passport === form.passport || c.fullName === form.fullName);
    if (!client) { toast({ title: 'Ошибка', description: 'Клиент не найден в базе. Сначала добавьте клиента.', variant: 'destructive' }); return; }
    const newAcc = {
      id: generateId(),
      accountNumber: '40817810' + Math.floor(Math.random() * 999999999999).toString().padStart(12, '0'),
      clientId: client.id,
      clientName: client.fullName,
      balance: 0,
      currency: 'RUB',
      type: 'checking' as const,
      typeLabel: 'Текущий',
      status: 'active' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };
    data.accounts.push(newAcc);
    client.accounts.push(newAcc.id);
    saveData(data);
    set('accountId', newAcc.accountNumber);
    setAccountNotFound(false);
    setShowCreateAccount(false);
    toast({ title: '✅ Счёт создан', description: `Счёт ${newAcc.accountNumber} создан для ${client.fullName}` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passport || !form.fullName || !form.accountId || !form.amount || !form.term || !form.endDate) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' }); return;
    }
    if (accountNotFound) { toast({ title: 'Ошибка', description: 'Счёт не найден. Создайте счёт.', variant: 'destructive' }); return; }
    setStep('sms');
  };

  const handleSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSms !== smsCode) { setSmsError('Неверный код'); return; }
    const data = loadData();
    const sum = parseFloat(form.amount);
    const creditId = generateId();
    const acc = data.accounts.find(a => a.accountNumber === form.accountId.trim());
    if (acc) {
      const i = data.accounts.findIndex(a => a.id === acc.id);
      data.accounts[i].balance += sum;
    }
    const client = data.clients.find(c => c.passport === form.passport || c.fullName === form.fullName);
    data.credits.push({
      id: creditId,
      clientId: client?.id || '',
      clientName: form.fullName,
      passport: form.passport,
      amount: sum,
      term: parseInt(form.term),
      rate: form.type === 'credit' ? 14.9 : 0,
      accountId: form.accountId,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: form.endDate,
      monthlyPayment: sum / parseInt(form.term),
      paidAmount: 0,
      type: form.type as 'credit' | 'installment',
      typeLabel: form.type === 'credit' ? 'Кредит' : 'Рассрочка',
    });
    data.transactions.unshift({
      id: generateId(), type: 'credit', typeLabel: form.type === 'credit' ? 'Кредит' : 'Рассрочка',
      amount: sum, currency: 'RUB', accountTo: form.accountId,
      clientId: client?.id || '', clientName: form.fullName,
      operatorId: employee.id, operatorName: employee.name,
      status: 'completed', date: new Date().toISOString(),
      description: `Выдача ${form.type === 'credit' ? 'кредита' : 'рассрочки'} на ${formatMoney(sum)}`,
    });
    saveData(data);
    downloadCreditReceipt(form, employee, creditId);
    toast({ title: '✅ Кредит оформлен', description: `${formatMoney(sum)} зачислено на счёт` });
    setStep('done');
  };

  const reset = () => {
    setForm({ type: 'credit', passport: '', fullName: '', accountId: '', amount: '', term: '12', endDate: '' });
    setStep('form'); setInputSms(''); setSmsError(''); setAccountNotFound(false);
  };

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(30,80%,50%,0.15)' }}>
          <Icon name="CreditCard" size={20} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Кредит / Рассрочка</h1>
          <p className="text-muted-foreground text-xs">Оформление и выдача · Скачать чек</p>
        </div>
      </div>

      {step === 'done' ? (
        <div className="sber-card p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
            <Icon name="CheckCircle2" size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Кредит оформлен</h2>
          <p className="text-muted-foreground mb-6">Чек скачан автоматически</p>
          <button onClick={reset} className="px-6 py-2.5 rounded-lg text-white font-medium" style={{ background: 'hsl(var(--primary))' }}>
            Новая заявка
          </button>
        </div>
      ) : step === 'sms' ? (
        <div className="sber-card p-8">
          <h2 className="text-lg font-bold text-white mb-4">Подтверждение кредита</h2>
          <div className="p-4 rounded-lg mb-6" style={{ background: 'hsla(30,80%,50%,0.1)', border: '1px solid hsla(30,80%,50%,0.2)' }}>
            <div className="text-sm text-muted-foreground">{form.type === 'credit' ? 'Кредит' : 'Рассрочка'} · {form.fullName}</div>
            <div className="text-2xl font-bold text-orange-400 font-mono">{formatMoney(parseFloat(form.amount))}</div>
            <div className="text-xs text-muted-foreground mt-1">Срок: {form.term} мес.</div>
          </div>
          <form onSubmit={handleSms} className="space-y-4">
            <input type="text" value={inputSms} onChange={e => setInputSms(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full sber-input text-xl text-center tracking-[0.5em] font-mono"
              placeholder="000000" />
            <button type="button" onClick={() => setInputSms(smsCode)} className="text-xs text-muted-foreground hover:text-primary underline">
              Тестовый режим: вставить код
            </button>
            {smsError && <p className="text-destructive text-sm">{smsError}</p>}
            <button type="submit" className="w-full py-2.5 rounded-lg text-white font-semibold" style={{ background: 'hsl(var(--primary))' }}>
              Подтвердить и оформить
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sber-card p-5 space-y-4">
            <div className="flex gap-2">
              {['credit', 'installment'].map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.type === t ? 'text-white' : 'text-muted-foreground'}`}
                  style={{ background: form.type === t ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>
                  {t === 'credit' ? 'Кредит' : 'Рассрочка'}
                </button>
              ))}
            </div>
            {[
              { key: 'passport', label: 'Номер паспорта', placeholder: '4520 123456' },
              { key: 'fullName', label: 'ФИО клиента', placeholder: 'Иванова Мария Сергеевна' },
              { key: 'amount', label: 'Сумма кредита (руб.)', placeholder: '100000', type: 'number' },
              { key: 'term', label: 'Срок (мес.)', placeholder: '12', type: 'number' },
              { key: 'endDate', label: 'Дата окончания', placeholder: '', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                  className="w-full sber-input"
                  placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Счёт / карта зачисления</label>
              <div className="flex gap-2">
                <input type="text" value={form.accountId} onChange={e => set('accountId', e.target.value)}
                  className="flex-1 sber-input font-mono"
                  placeholder="40817810000000000001" />
                <button type="button" onClick={checkAccount} className="px-4 py-2.5 rounded-lg text-sm font-medium text-foreground border border-border hover:bg-secondary transition-colors bg-white">
                  Проверить
                </button>
              </div>
              {accountNotFound && (
                <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-yellow-400 text-xs mb-2">Счёт не найден в системе</p>
                  <button type="button" onClick={() => setShowCreateAccount(true)} className="text-xs text-primary underline hover:opacity-80">
                    + Создать новый счёт и вернуться к операции
                  </button>
                </div>
              )}
            </div>
          </div>

          {showCreateAccount && (
            <div className="sber-card p-5 border-yellow-500/30">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Icon name="PlusCircle" size={16} className="text-primary" /> Создание счёта
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Счёт будет привязан к клиенту с паспортом {form.passport}</p>
              <button type="button" onClick={handleCreateAccount} className="w-full py-2.5 rounded-lg text-white text-sm font-medium" style={{ background: 'hsl(var(--primary))' }}>
                Создать счёт и вернуться к оформлению
              </button>
            </div>
          )}

          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
            Оформить {form.type === 'credit' ? 'кредит' : 'рассрочку'} · Подтвердить по SMS
          </button>
        </form>
      )}
    </div>
  );
}