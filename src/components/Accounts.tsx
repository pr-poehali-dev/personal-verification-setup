import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, generateAccountNumber, formatMoney, Account } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

export default function Accounts() {
  const { toast } = useToast();
  const [data, setData] = useState(loadData);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ clientId: '', type: 'checking', currency: 'RUB', initialBalance: '0' });

  const refresh = () => setData(loadData());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const d = loadData();
    const client = d.clients.find(c => c.id === form.clientId);
    if (!client) { toast({ title: 'Ошибка', description: 'Клиент не найден', variant: 'destructive' }); return; }
    const typeLabels: Record<string, string> = { checking: 'Текущий', savings: 'Сберегательный', credit: 'Кредитный', deposit: 'Депозитный' };
    const acc: Account = {
      id: generateId(), accountNumber: generateAccountNumber(), clientId: client.id, clientName: client.fullName,
      balance: parseFloat(form.initialBalance) || 0, currency: form.currency,
      type: form.type as Account['type'], typeLabel: typeLabels[form.type], status: 'active', createdAt: new Date().toISOString().split('T')[0],
    };
    d.accounts.push(acc); client.accounts.push(acc.id); saveData(d);
    toast({ title: '✅ Счёт открыт', description: acc.accountNumber });
    setForm({ clientId: '', type: 'checking', currency: 'RUB', initialBalance: '0' });
    setShowAdd(false); refresh();
  };

  const toggleFreeze = (accId: string) => {
    const d = loadData();
    const i = d.accounts.findIndex(a => a.id === accId);
    if (i !== -1) {
      d.accounts[i].status = d.accounts[i].status === 'active' ? 'frozen' : 'active';
      saveData(d); refresh();
    }
  };

  const filtered = data.accounts.filter(a =>
    a.accountNumber.includes(search) || a.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = data.accounts.filter(a => a.status === 'active').reduce((s, a) => s + a.balance, 0);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
            <Icon name="BookOpen" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Учёт счетов</h1>
            <p className="text-muted-foreground text-xs">{data.accounts.length} счетов · Общий баланс: {formatMoney(totalBalance)}</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
          <Icon name="Plus" size={16} /> Открыть счёт
        </button>
      </div>

      {showAdd && (
        <div className="sber-card p-5 mb-6 animate-scale-in">
          <h3 className="text-white font-semibold mb-4">Открыть новый счёт</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Клиент</label>
              <select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required
                className="w-full sber-input">
                <option value="">Выберите клиента</option>
                {data.clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Тип счёта</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full sber-input">
                <option value="checking">Текущий</option>
                <option value="savings">Сберегательный</option>
                <option value="deposit">Депозитный</option>
                <option value="credit">Кредитный</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Нач. баланс (₽)</label>
              <input type="number" value={form.initialBalance} onChange={e => setForm(f => ({ ...f, initialBalance: e.target.value }))}
                className="w-full sber-input"
                min="0" step="0.01" />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-muted-foreground text-sm border border-border">Отмена</button>
              <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'hsl(var(--primary))' }}>Создать счёт</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full sber-input pl-9 pr-4"
            placeholder="Поиск по номеру счёта или клиенту..." />
        </div>
      </div>

      <div className="sber-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Номер счёта', 'Клиент', 'Тип', 'Баланс', 'Валюта', 'Статус', 'Действия'].map(h => (
                <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted-foreground py-8">Счета не найдены</td></tr>
            ) : filtered.map(acc => (
              <tr key={acc.id} className="hover:bg-secondary transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-white">{acc.accountNumber}</td>
                <td className="px-4 py-3 text-sm text-white">{acc.clientName}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{acc.typeLabel}</td>
                <td className="px-4 py-3 font-mono font-semibold text-sm text-primary">{formatMoney(acc.balance)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{acc.currency}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    acc.status === 'active' ? 'bg-green-500/15 text-green-400' :
                    acc.status === 'frozen' ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {acc.status === 'active' ? 'Активен' : acc.status === 'frozen' ? 'Заморожен' : 'Закрыт'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFreeze(acc.id)} className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1">
                    <Icon name={acc.status === 'active' ? 'Lock' : 'Unlock'} size={12} />
                    {acc.status === 'active' ? 'Заморозить' : 'Разморозить'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}