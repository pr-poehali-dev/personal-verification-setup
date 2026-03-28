import Icon from '@/components/ui/icon';
import { loadData, formatMoney } from '@/data/store';

export default function Analytics() {
  const data = loadData();
  const txns = data.transactions;

  const byType = txns.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const countByType = txns.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byOperator = txns.reduce((acc, t) => {
    if (!acc[t.operatorName]) acc[t.operatorName] = { count: 0, volume: 0 };
    acc[t.operatorName].count++;
    acc[t.operatorName].volume += t.amount;
    return acc;
  }, {} as Record<string, { count: number; volume: number }>);

  const totalVolume = txns.reduce((s, t) => s + t.amount, 0);
  const totalClients = data.clients.length;
  const totalAccounts = data.accounts.length;
  const totalBalance = data.accounts.reduce((s, a) => s + a.balance, 0);
  const activeCredits = data.credits.filter(c => c.status === 'active').length;
  const creditVolume = data.credits.filter(c => c.status === 'active').reduce((s, c) => s + c.amount, 0);

  const typeLabels: Record<string, string> = {
    cash_out: 'Выдача наличных', cash_in: 'Взнос наличных',
    transfer: 'Переводы', credit: 'Кредиты', card_issue: 'Выпуск карт',
  };

  const typeColors: Record<string, string> = {
    cash_out: '#ef4444', cash_in: '#22c55e', transfer: '#a855f7', credit: '#f97316', card_issue: '#3b82f6',
  };

  const stats = [
    { label: 'Всего операций', value: txns.length, icon: 'Activity', color: 'text-primary' },
    { label: 'Общий оборот', value: formatMoney(totalVolume), icon: 'TrendingUp', color: 'text-blue-400' },
    { label: 'Клиентов', value: totalClients, icon: 'Users', color: 'text-cyan-400' },
    { label: 'Счетов', value: totalAccounts, icon: 'BookOpen', color: 'text-purple-400' },
    { label: 'Активных кредитов', value: activeCredits, icon: 'CreditCard', color: 'text-orange-400' },
    { label: 'Объём кредитов', value: formatMoney(creditVolume), icon: 'Wallet', color: 'text-yellow-400' },
    { label: 'Средства на счетах', value: formatMoney(totalBalance), icon: 'PiggyBank', color: 'text-green-400' },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
          <Icon name="BarChart3" size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Отчёты и аналитика</h1>
          <p className="text-muted-foreground text-xs">Статистика по всем операциям системы</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="sber-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon} size={14} className={s.color} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sber-card p-5">
          <h2 className="text-white font-semibold mb-4">Операции по типам</h2>
          {Object.keys(byType).length === 0 ? (
            <p className="text-muted-foreground text-sm">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byType).map(([type, volume]) => {
                const pct = totalVolume > 0 ? (volume / totalVolume) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{typeLabels[type] || type}</span>
                      <div className="text-right">
                        <span className="text-sm font-mono text-primary">{formatMoney(volume)}</span>
                        <span className="text-xs text-muted-foreground ml-2">({countByType[type] || 0} оп.)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: typeColors[type] || '#888' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sber-card p-5">
          <h2 className="text-white font-semibold mb-4">Активность операционистов</h2>
          {Object.keys(byOperator).length === 0 ? (
            <p className="text-muted-foreground text-sm">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byOperator).sort((a, b) => b[1].volume - a[1].volume).map(([name, stats]) => (
                <div key={name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'hsl(var(--primary))' }}>
                      {name.charAt(0)}
                    </div>
                    <span className="text-sm text-white">{name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-primary">{formatMoney(stats.volume)}</div>
                    <div className="text-xs text-muted-foreground">{stats.count} операций</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sber-card p-5 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Активные кредиты</h2>
          {data.credits.length === 0 ? (
            <p className="text-muted-foreground text-sm">Кредитов нет</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Клиент', 'Тип', 'Сумма', 'Срок', 'Платёж/мес', 'Статус'].map(h => (
                      <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wide px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.credits.map(c => (
                    <tr key={c.id} className="border-b border-border hover:bg-secondary transition-colors">
                      <td className="px-3 py-2 text-sm text-white">{c.clientName}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.typeLabel}</td>
                      <td className="px-3 py-2 font-mono text-sm text-primary">{formatMoney(c.amount)}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.term} мес.</td>
                      <td className="px-3 py-2 font-mono text-sm text-orange-400">{formatMoney(c.monthlyPayment)}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-500/15 text-green-400' : c.status === 'overdue' ? 'bg-red-500/15 text-red-400' : 'bg-secondary text-muted-foreground'}`}>
                          {c.status === 'active' ? 'Активен' : c.status === 'overdue' ? 'Просрочен' : 'Закрыт'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
