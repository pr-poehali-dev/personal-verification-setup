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
  const activeClients = data.clients.length;

  const stats = [
    { label: 'Операций сегодня', value: todayTxns.length.toString(), icon: 'Activity', color: 'text-primary' },
    { label: 'Оборот сегодня', value: formatMoney(todayVolume), icon: 'TrendingUp', color: 'text-blue-400' },
    { label: 'В очереди', value: waitingQueue.toString(), icon: 'Users', color: 'text-yellow-400' },
    { label: 'Активных счетов', value: activeAccounts.toString(), icon: 'BookOpen', color: 'text-purple-400' },
    { label: 'Клиентов в базе', value: activeClients.toString(), icon: 'UserCheck', color: 'text-cyan-400' },
  ];

  const quickOps = [
    { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowDownCircle', desc: 'ОКУД 0402009', color: 'hsl(145,63%,38%)' },
    { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowUpCircle', desc: 'ОКУД 0402008', color: 'hsl(210,63%,45%)' },
    { id: 'transfer', label: 'Перевод', icon: 'ArrowLeftRight', desc: 'Между счетами', color: 'hsl(260,63%,55%)' },
    { id: 'credits', label: 'Кредит', icon: 'CreditCard', desc: 'Выдача кредита', color: 'hsl(30,80%,50%)' },
    { id: 'cards', label: 'Выпуск карты', icon: 'Wallet', desc: 'Новая карта', color: 'hsl(0,63%,50%)' },
    { id: 'queue', label: 'Очередь', icon: 'ListOrdered', desc: 'Управление', color: 'hsl(180,63%,40%)' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Добро пожаловать, {employee.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {employee.roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'hsla(145,63%,42%,0.15)', border: '1px solid hsla(145,63%,42%,0.3)' }}>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary">Система активна</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="sber-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon} size={16} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick ops */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Быстрые операции</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickOps.map(op => (
            <button
              key={op.id}
              onClick={() => onNavigate(op.id)}
              className="sber-card p-5 text-left hover:border-primary transition-all group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${op.color}22`, border: `1px solid ${op.color}44` }}>
                <Icon name={op.icon} size={20} style={{ color: op.color }} />
              </div>
              <div className="text-white font-medium text-sm group-hover:text-primary transition-colors">{op.label}</div>
              <div className="text-muted-foreground text-xs mt-1">{op.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Последние операции</h2>
          <button onClick={() => onNavigate('history')} className="text-xs text-primary hover:underline">Все операции →</button>
        </div>
        <div className="sber-card overflow-hidden">
          {data.transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Операций ещё не было</div>
          ) : (
            <div className="divide-y divide-border">
              {data.transactions.slice(0, 5).map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-4 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'cash_out' ? 'bg-red-500/15' : txn.type === 'cash_in' ? 'bg-green-500/15' : 'bg-blue-500/15'}`}>
                      <Icon name={txn.type === 'cash_out' ? 'ArrowDownCircle' : txn.type === 'cash_in' ? 'ArrowUpCircle' : 'ArrowLeftRight'} size={16}
                        className={txn.type === 'cash_out' ? 'text-red-400' : txn.type === 'cash_in' ? 'text-green-400' : 'text-blue-400'} />
                    </div>
                    <div>
                      <div className="text-sm text-white">{txn.typeLabel}</div>
                      <div className="text-xs text-muted-foreground">{txn.clientName} · {formatDate(txn.date)}</div>
                    </div>
                  </div>
                  <div className={`font-mono font-semibold text-sm ${txn.type === 'cash_out' ? 'text-red-400' : 'text-primary'}`}>
                    {txn.type === 'cash_out' ? '-' : '+'}{formatMoney(txn.amount)}
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
