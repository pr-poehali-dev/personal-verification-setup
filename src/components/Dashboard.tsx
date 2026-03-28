import Icon from '@/components/ui/icon';
import { Employee, loadData, formatMoney, formatDate } from '@/data/store';

interface DashboardProps {
  employee: Employee;
  onNavigate: (section: string) => void;
}

export default function Dashboard({ employee, onNavigate }: DashboardProps) {
  const data = loadData();
  const today = new Date().toDateString();
  const todayTxns = data.transactions.filter(t => new Date(t.date).toDateString() === today);
  const todayVolume = todayTxns.reduce((s, t) => s + t.amount, 0);
  const waitingQueue = data.queue.filter(q => q.status === 'waiting').length;
  const activeAccounts = data.accounts.filter(a => a.status === 'active').length;

  const stats = [
    { label: 'Операций сегодня', value: String(todayTxns.length), icon: 'Activity', accent: 'hsl(var(--primary))' },
    { label: 'Оборот сегодня', value: formatMoney(todayVolume), icon: 'TrendingUp', accent: '#2563eb' },
    { label: 'В очереди', value: String(waitingQueue), icon: 'Users', accent: '#d97706' },
    { label: 'Активных счетов', value: String(activeAccounts), icon: 'BookOpen', accent: '#7c3aed' },
    { label: 'Клиентов', value: String(data.clients.length), icon: 'UserCheck', accent: '#0891b2' },
  ];

  const quickOps = [
    { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowDownCircle', desc: 'ОКУД 0402009', color: '#ef4444', bg: '#fef2f2' },
    { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowUpCircle', desc: 'ОКУД 0402008', color: '#16a34a', bg: '#f0fdf4' },
    { id: 'transfer', label: 'Перевод', icon: 'ArrowLeftRight', desc: 'Между счетами', color: '#7c3aed', bg: '#f5f3ff' },
    { id: 'credits', label: 'Кредит', icon: 'CreditCard', desc: 'Выдача кредита', color: '#d97706', bg: '#fffbeb' },
    { id: 'cards', label: 'Карты', icon: 'Wallet', desc: 'Выпуск карты', color: '#0891b2', bg: '#ecfeff' },
    { id: 'queue', label: 'Очередь', icon: 'ListOrdered', desc: 'Управление', color: '#6366f1', bg: '#eef2ff' },
  ];

  const typeIcons: Record<string, string> = {
    cash_out: 'ArrowDownCircle', cash_in: 'ArrowUpCircle', transfer: 'ArrowLeftRight',
    credit: 'CreditCard', card_issue: 'Wallet',
  };
  const typeColors: Record<string, string> = {
    cash_out: '#ef4444', cash_in: '#16a34a', transfer: '#7c3aed',
    credit: '#d97706', card_issue: '#0891b2',
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Добро пожаловать, {employee.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}{employee.roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
          style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#16a34a' }} />
          Система активна
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="sber-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon} size={14} style={{ color: s.accent }} />
              <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick ops */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Быстрые операции</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickOps.map(op => (
            <button
              key={op.id}
              onClick={() => onNavigate(op.id)}
              className="sber-card p-4 text-left hover:shadow-md transition-all group hover:border-primary/30"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: op.bg }}>
                <Icon name={op.icon} size={18} style={{ color: op.color }} />
              </div>
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {op.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{op.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Последние операции</h2>
          <button onClick={() => onNavigate('history')} className="text-xs text-primary hover:underline">
            Все операции →
          </button>
        </div>
        <div className="sber-card overflow-hidden">
          {data.transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Операций ещё не было</div>
          ) : (
            <div className="divide-y divide-border">
              {data.transactions.slice(0, 6).map(txn => (
                <div key={txn.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${typeColors[txn.type] || '#888'}18` }}>
                      <Icon name={typeIcons[txn.type] || 'Circle'} size={15}
                        style={{ color: typeColors[txn.type] || '#888' }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{txn.typeLabel}</div>
                      <div className="text-xs text-muted-foreground">{txn.clientName} · {formatDate(txn.date)}</div>
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-sm"
                    style={{ color: txn.type === 'cash_out' ? '#ef4444' : '#16a34a' }}>
                    {txn.type === 'cash_out' ? '−' : '+'}{formatMoney(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
