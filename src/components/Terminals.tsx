import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, Terminal } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

export default function Terminals() {
  const { toast } = useToast();
  const [data, setData] = useState(loadData);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', ipAddress: '', location: '' });

  const refresh = () => setData(loadData());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const d = loadData();
    const terminal: Terminal = {
      id: generateId(), ipAddress: form.ipAddress, name: form.name, location: form.location,
      status: 'offline', lastPing: new Date().toISOString(),
    };
    d.terminals.push(terminal); saveData(d);
    toast({ title: '✅ Терминал добавлен', description: `${form.name} · ${form.ipAddress}` });
    setForm({ name: '', ipAddress: '', location: '' }); setShowAdd(false); refresh();
  };

  const handlePing = (termId: string) => {
    const d = loadData();
    const i = d.terminals.findIndex(t => t.id === termId);
    if (i !== -1) {
      d.terminals[i].status = Math.random() > 0.3 ? 'online' : 'error';
      d.terminals[i].lastPing = new Date().toISOString();
      saveData(d); refresh();
      toast({ title: d.terminals[i].status === 'online' ? '✅ Терминал доступен' : '❌ Терминал недоступен', description: d.terminals[i].ipAddress });
    }
  };

  const handleRemove = (termId: string) => {
    const d = loadData();
    d.terminals = d.terminals.filter(t => t.id !== termId); saveData(d); refresh();
    toast({ title: 'Терминал удалён' });
  };

  const statusColors: Record<string, string> = {
    online: 'text-green-400', offline: 'text-muted-foreground', error: 'text-red-400',
  };
  const statusLabels: Record<string, string> = { online: 'Онлайн', offline: 'Офлайн', error: 'Ошибка' };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(210,63%,45%,0.15)' }}>
            <Icon name="Monitor" size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Терминалы Сбер</h1>
            <p className="text-muted-foreground text-xs">Подключение по IP-адресу · {data.terminals.filter(t => t.status === 'online').length} онлайн</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
          <Icon name="Plus" size={16} /> Добавить терминал
        </button>
      </div>

      {showAdd && (
        <div className="sber-card p-5 mb-6 animate-scale-in">
          <h3 className="text-white font-semibold mb-4">Новый терминал</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Название</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full sber-input"
                placeholder="Терминал №3" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">IP-адрес</label>
              <input value={form.ipAddress} onChange={e => setForm(f => ({ ...f, ipAddress: e.target.value }))} required
                className="w-full sber-input font-mono"
                placeholder="192.168.1.103" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Расположение</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} required
                className="w-full sber-input"
                placeholder="Касса 3" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 rounded-lg text-white font-medium text-sm" style={{ background: 'hsl(var(--primary))' }}>
                Подключить
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.terminals.map(term => (
          <div key={term.id} className="sber-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${term.status === 'online' ? '' : ''}`}
                  style={{ background: term.status === 'online' ? 'hsla(145,63%,42%,0.15)' : 'hsla(0,0%,50%,0.1)' }}>
                  <Icon name="Monitor" size={18} className={statusColors[term.status]} />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{term.name}</div>
                  <div className="text-muted-foreground text-xs">{term.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${term.status === 'online' ? 'bg-green-400 animate-pulse' : term.status === 'error' ? 'bg-red-400' : 'bg-muted-foreground'}`} />
                <span className={`text-xs ${statusColors[term.status]}`}>{statusLabels[term.status]}</span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Wifi" size={12} className="text-muted-foreground" />
                <span className="text-xs font-mono text-white">{term.ipAddress}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Последний пинг: {new Date(term.lastPing).toLocaleTimeString('ru-RU')}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handlePing(term.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-white border border-border hover:border-primary transition-colors">
                <Icon name="RefreshCw" size={12} /> Пинг
              </button>
              <button onClick={() => handleRemove(term.id)} className="flex items-center justify-center px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive border border-border hover:border-destructive transition-colors">
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}