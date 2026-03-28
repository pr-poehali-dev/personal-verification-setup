import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, formatMoney, formatDate } from '@/data/store';

export default function History() {
  const data = loadData();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const typeColors: Record<string, string> = {
    cash_out: 'text-red-400', cash_in: 'text-primary', transfer: 'text-purple-400',
    credit: 'text-orange-400', card_issue: 'text-blue-400',
  };
  const typeIcons: Record<string, string> = {
    cash_out: 'ArrowDownCircle', cash_in: 'ArrowUpCircle', transfer: 'ArrowLeftRight',
    credit: 'CreditCard', card_issue: 'Wallet',
  };

  const filtered = data.transactions.filter(t => {
    const matchType = filter === 'all' || t.type === filter;
    const matchSearch = search === '' || t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) || t.operatorName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalVolume = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
          <Icon name="Clock" size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">История операций</h1>
          <p className="text-muted-foreground text-xs">Всего операций: {data.transactions.length} · Объём: {formatMoney(totalVolume)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: 'all', label: 'Все' },
          { value: 'cash_out', label: 'Выдача' },
          { value: 'cash_in', label: 'Взнос' },
          { value: 'transfer', label: 'Переводы' },
          { value: 'credit', label: 'Кредиты' },
          { value: 'card_issue', label: 'Карты' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f.value ? 'text-white' : 'text-muted-foreground hover:text-white border border-border'}`}
            style={filter === f.value ? { background: 'hsl(var(--primary))' } : {}}>
            {f.label}
          </button>
        ))}
        <div className="flex-1 max-w-xs ml-auto">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full sber-input pl-8 pr-3 text-xs"
              placeholder="Поиск..." />
          </div>
        </div>
      </div>

      <div className="sber-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Дата', 'Тип', 'Клиент', 'Сумма', 'Оператор', 'Статус', 'ОКУД'].map(h => (
                  <th key={h} className="text-left text-xs text-muted-foreground uppercase tracking-wide px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted-foreground py-8">Операций нет</td></tr>
              ) : filtered.map(txn => (
                <tr key={txn.id} className="hover:bg-secondary transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{formatDate(txn.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon name={typeIcons[txn.type] || 'Circle'} size={14} className={typeColors[txn.type] || 'text-white'} />
                      <span className="text-xs text-white">{txn.typeLabel}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{txn.clientName}</td>
                  <td className={`px-4 py-3 font-mono font-semibold text-sm ${typeColors[txn.type] || 'text-white'}`}>
                    {txn.type === 'cash_out' ? '-' : '+'}{formatMoney(txn.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{txn.operatorName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${txn.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                      {txn.status === 'completed' ? 'Выполнено' : 'В обработке'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{txn.okudCode || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}