import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, generateTicketCode, Employee, QueueTicket } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

interface QueueProps { employee: Employee; }

const OPERATIONS = [
  { code: 'cash_out', label: 'Выдача наличных', icon: 'ArrowDownCircle' },
  { code: 'cash_in', label: 'Взнос наличных', icon: 'ArrowUpCircle' },
  { code: 'transfer', label: 'Перевод', icon: 'ArrowLeftRight' },
  { code: 'credit', label: 'Кредит / Рассрочка', icon: 'CreditCard' },
  { code: 'card_issue', label: 'Выпуск карты', icon: 'Wallet' },
  { code: 'consult', label: 'Консультация', icon: 'MessageCircle' },
];

function downloadTicket(ticket: QueueTicket) {
  const date = new Date(ticket.createdAt);
  const content = `
╔════════════════════════════════════╗
║       АС ЕФС СБОЛ.про             ║
║   ЭЛЕКТРОННАЯ ОЧЕРЕДЬ             ║
╠════════════════════════════════════╣
║  ТАЛОН №: ${ticket.ticketNumber.padEnd(26)}║
║  Операция: ${ticket.operationType.substring(0, 25).padEnd(25)}║
║  Дата: ${date.toLocaleDateString('ru-RU').padEnd(29)}║
║  Время: ${date.toLocaleTimeString('ru-RU').padEnd(28)}║
╚════════════════════════════════════╝

Ожидайте вызова!
Ваш номер: ${ticket.ticketNumber}
`;
  const link = document.createElement('a');
  link.href = `data:text/plain;charset=utf-8,` + encodeURIComponent(content);
  link.download = `Талон_${ticket.ticketNumber}_${Date.now()}.txt`;
  link.click();
}

export default function Queue({ employee }: QueueProps) {
  const { toast } = useToast();
  const [data, setData] = useState(loadData);
  const [addForm, setAddForm] = useState({ clientName: '', phone: '', operationCode: 'cash_out' });
  const [showAdd, setShowAdd] = useState(false);
  const [currentClient, setCurrentClient] = useState<QueueTicket | null>(null);
  const [showOperation, setShowOperation] = useState(false);

  const refresh = () => setData(loadData());

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const d = loadData();
    const op = OPERATIONS.find(o => o.code === addForm.operationCode);
    const ticket: QueueTicket = {
      id: generateId(),
      ticketNumber: generateTicketCode(),
      clientName: addForm.clientName,
      phone: addForm.phone,
      operationType: op?.label || addForm.operationCode,
      operationCode: addForm.operationCode,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    d.queue.unshift(ticket);
    saveData(d);
    downloadTicket(ticket);
    toast({ title: '✅ Клиент добавлен в очередь', description: `Талон ${ticket.ticketNumber} · ${ticket.operationType}` });
    setAddForm({ clientName: '', phone: '', operationCode: 'cash_out' });
    setShowAdd(false);
    refresh();
  };

  const handleTakeNext = () => {
    const d = loadData();
    const next = d.queue.filter(q => q.status === 'waiting').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    if (!next) { toast({ title: 'Очередь пуста', description: 'Нет ожидающих клиентов', variant: 'destructive' }); return; }
    const i = d.queue.findIndex(q => q.id === next.id);
    d.queue[i].status = 'serving';
    d.queue[i].windowNumber = 1;
    saveData(d);
    setCurrentClient(d.queue[i]);
    setShowOperation(true);
    refresh();
  };

  const handleComplete = (ticketId: string) => {
    const d = loadData();
    const i = d.queue.findIndex(q => q.id === ticketId);
    if (i !== -1) { d.queue[i].status = 'completed'; saveData(d); }
    setShowOperation(false); setCurrentClient(null);
    toast({ title: '✅ Клиент обслужен' });
    refresh();
  };

  const handleSkip = (ticketId: string) => {
    const d = loadData();
    const i = d.queue.findIndex(q => q.id === ticketId);
    if (i !== -1) { d.queue[i].status = 'skipped'; saveData(d); }
    setShowOperation(false); setCurrentClient(null);
    toast({ title: 'Клиент пропущен' });
    refresh();
  };

  const waiting = data.queue.filter(q => q.status === 'waiting').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const serving = data.queue.filter(q => q.status === 'serving');
  const done = data.queue.filter(q => q.status === 'completed' || q.status === 'skipped').slice(0, 10);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(180,63%,40%,0.15)' }}>
            <Icon name="ListOrdered" size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Электронная очередь</h1>
            <p className="text-muted-foreground text-xs">Управление · {waiting.length} ожидают</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleTakeNext} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,46%))' }}>
            <Icon name="UserCheck" size={16} /> Взять следующего клиента
          </button>
          <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm border border-border hover:border-primary transition-colors">
            <Icon name="UserPlus" size={16} /> Добавить
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="sber-card p-5 mb-6 animate-scale-in">
          <h3 className="text-white font-medium mb-4">Добавить клиента в очередь</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">ФИО клиента</label>
              <input value={addForm.clientName} onChange={e => setAddForm(f => ({ ...f, clientName: e.target.value }))} required
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Иванова Мария С." />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Телефон</label>
              <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} required
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+7 (999) 000-00-00" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Тип операции</label>
              <select value={addForm.operationCode} onChange={e => setAddForm(f => ({ ...f, operationCode: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {OPERATIONS.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 rounded-lg text-white font-medium text-sm" style={{ background: 'hsl(var(--primary))' }}>
                Добавить + Скачать талон
              </button>
            </div>
          </form>
        </div>
      )}

      {showOperation && currentClient && (
        <div className="sber-card p-5 mb-6 border-primary animate-scale-in" style={{ borderColor: 'hsl(var(--primary))' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'hsl(var(--primary))' }}>
                {currentClient.ticketNumber}
              </div>
              <div>
                <div className="text-white font-semibold">{currentClient.clientName}</div>
                <div className="text-muted-foreground text-xs">{currentClient.phone} · {currentClient.operationType}</div>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary">Обслуживается</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Предложите клиенту операции:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {OPERATIONS.filter(o => o.code === currentClient.operationCode || true).map(op => (
              <button key={op.code} type="button"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${op.code === currentClient.operationCode ? 'text-white border-primary' : 'text-muted-foreground border-border hover:border-border hover:text-white'}`}
                style={op.code === currentClient.operationCode ? { background: 'hsla(145,63%,42%,0.2)' } : {}}>
                <Icon name={op.icon} size={14} className={op.code === currentClient.operationCode ? 'text-primary' : ''} />
                {op.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleComplete(currentClient.id)} className="flex-1 py-2.5 rounded-lg text-white font-medium text-sm" style={{ background: 'hsl(var(--primary))' }}>
              ✅ Клиент обслужен
            </button>
            <button onClick={() => handleSkip(currentClient.id)} className="px-4 py-2.5 rounded-lg text-muted-foreground hover:text-white border border-border text-sm transition-colors">
              Пропустить
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center justify-center">{waiting.length}</span>
            Ожидают
          </h2>
          <div className="space-y-2">
            {waiting.length === 0 ? <div className="text-muted-foreground text-sm text-center py-4">Очередь пуста</div> : waiting.map(t => (
              <div key={t.id} className="sber-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold font-mono text-sm">{t.ticketNumber}</span>
                    <div>
                      <div className="text-white text-xs">{t.clientName}</div>
                      <div className="text-muted-foreground text-xs">{t.operationType}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">{serving.length}</span>
            Обслуживаются
          </h2>
          <div className="space-y-2">
            {serving.length === 0 ? <div className="text-muted-foreground text-sm text-center py-4">—</div> : serving.map(t => (
              <div key={t.id} className="sber-card p-3 border-primary/40">
                <div className="text-primary font-bold font-mono">{t.ticketNumber}</div>
                <div className="text-white text-xs">{t.clientName}</div>
                <div className="text-muted-foreground text-xs">{t.operationType}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center">{done.length}</span>
            Завершены
          </h2>
          <div className="space-y-2">
            {done.length === 0 ? <div className="text-muted-foreground text-sm text-center py-4">—</div> : done.map(t => (
              <div key={t.id} className="sber-card p-3 opacity-60">
                <div className="text-muted-foreground font-mono text-sm">{t.ticketNumber}</div>
                <div className="text-muted-foreground text-xs">{t.clientName} · {t.status === 'completed' ? 'Обслужен' : 'Пропущен'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
