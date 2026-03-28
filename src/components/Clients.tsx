import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, generateAccountNumber, formatMoney, Client, Account } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

export default function Clients() {
  const { toast } = useToast();
  const [data, setData] = useState(loadData);
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ fullName: '', passport: '', phone: '', email: '', birthDate: '', address: '' });
  const [accForm, setAccForm] = useState({ type: 'checking', currency: 'RUB' });

  const refresh = () => setData(loadData());
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const d = loadData();
    if (d.clients.find(c => c.passport === form.passport)) {
      toast({ title: 'Ошибка', description: 'Клиент с таким паспортом уже существует', variant: 'destructive' }); return;
    }
    const client: Client = {
      id: generateId(), fullName: form.fullName, passport: form.passport, phone: form.phone,
      email: form.email, birthDate: form.birthDate, address: form.address,
      createdAt: new Date().toISOString().split('T')[0], accounts: [], cards: [],
    };
    d.clients.push(client); saveData(d);
    toast({ title: '✅ Клиент добавлен', description: client.fullName });
    setForm({ fullName: '', passport: '', phone: '', email: '', birthDate: '', address: '' });
    setShowAddClient(false); refresh();
  };

  const handleAddAccount = (clientId: string) => {
    const d = loadData();
    const client = d.clients.find(c => c.id === clientId);
    if (!client) return;
    const typeLabels: Record<string, string> = { checking: 'Текущий', savings: 'Сберегательный', credit: 'Кредитный', deposit: 'Депозитный' };
    const acc: Account = {
      id: generateId(), accountNumber: generateAccountNumber(), clientId, clientName: client.fullName,
      balance: 0, currency: accForm.currency, type: accForm.type as Account['type'],
      typeLabel: typeLabels[accForm.type], status: 'active', createdAt: new Date().toISOString().split('T')[0],
    };
    d.accounts.push(acc); client.accounts.push(acc.id); saveData(d);
    toast({ title: '✅ Счёт создан', description: acc.accountNumber });
    setShowAddAccount(null); refresh();
  };

  const filtered = data.clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.passport.includes(search) || c.phone.includes(search)
  );

  const getClientAccounts = (clientId: string) => data.accounts.filter(a => a.clientId === clientId);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
            <Icon name="Users" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Клиентская база</h1>
            <p className="text-muted-foreground text-xs">{data.clients.length} клиентов в системе</p>
          </div>
        </div>
        <button onClick={() => setShowAddClient(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
          <Icon name="UserPlus" size={16} /> Добавить клиента
        </button>
      </div>

      {showAddClient && (
        <div className="sber-card p-5 mb-6 animate-scale-in">
          <h3 className="text-white font-semibold mb-4">Новый клиент</h3>
          <form onSubmit={handleAddClient} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'fullName', label: 'ФИО', placeholder: 'Иванова Мария Сергеевна' },
              { key: 'passport', label: 'Паспорт', placeholder: '4520 123456' },
              { key: 'phone', label: 'Телефон', placeholder: '+7 (916) 000-00-00' },
              { key: 'email', label: 'Email', placeholder: 'client@mail.ru' },
              { key: 'birthDate', label: 'Дата рождения', placeholder: '', type: 'date' },
              { key: 'address', label: 'Адрес', placeholder: 'г. Москва, ул...' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key as keyof typeof form]} required
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={f.placeholder} />
              </div>
            ))}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddClient(false)} className="px-4 py-2 rounded-lg text-muted-foreground text-sm border border-border hover:text-white transition-colors">
                Отмена
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'hsl(var(--primary))' }}>
                Сохранить
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Поиск по ФИО, паспорту, телефону..." />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="sber-card p-8 text-center text-muted-foreground">Клиенты не найдены</div>
        ) : filtered.map(client => {
          const accs = getClientAccounts(client.id);
          const isSelected = selectedClient?.id === client.id;
          return (
            <div key={client.id} className="sber-card overflow-hidden">
              <button className="w-full p-4 text-left hover:bg-secondary transition-colors" onClick={() => setSelectedClient(isSelected ? null : client)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'hsl(var(--primary))' }}>
                      {client.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{client.fullName}</div>
                      <div className="text-muted-foreground text-xs">{client.passport} · {client.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{accs.length} счетов</span>
                    <Icon name={isSelected ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
                  </div>
                </div>
              </button>
              {isSelected && (
                <div className="border-t border-border p-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Email: </span><span className="text-white">{client.email}</span></div>
                    <div><span className="text-muted-foreground">Дата рожд.: </span><span className="text-white">{client.birthDate}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Адрес: </span><span className="text-white">{client.address}</span></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Счета клиента</span>
                      <button onClick={() => setShowAddAccount(showAddAccount === client.id ? null : client.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline">
                        <Icon name="Plus" size={12} /> Открыть счёт
                      </button>
                    </div>
                    {showAddAccount === client.id && (
                      <div className="p-3 rounded-lg mb-2 flex gap-2" style={{ background: 'hsla(145,63%,42%,0.08)', border: '1px solid hsla(145,63%,42%,0.2)' }}>
                        <select value={accForm.type} onChange={e => setAccForm(f => ({ ...f, type: e.target.value }))}
                          className="flex-1 bg-secondary border border-border rounded py-1.5 px-2 text-white text-xs focus:outline-none">
                          <option value="checking">Текущий</option>
                          <option value="savings">Сберегательный</option>
                          <option value="deposit">Депозитный</option>
                        </select>
                        <button onClick={() => handleAddAccount(client.id)} className="px-3 py-1.5 rounded text-white text-xs font-medium" style={{ background: 'hsl(var(--primary))' }}>
                          Создать
                        </button>
                      </div>
                    )}
                    {accs.length === 0 ? (
                      <div className="text-muted-foreground text-xs py-2">Счетов нет</div>
                    ) : accs.map(acc => (
                      <div key={acc.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <div className="text-white text-xs font-mono">{acc.accountNumber}</div>
                          <div className="text-muted-foreground text-xs">{acc.typeLabel} · {acc.status === 'active' ? 'Активен' : 'Закрыт'}</div>
                        </div>
                        <div className="text-primary font-mono text-sm font-semibold">{formatMoney(acc.balance)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
