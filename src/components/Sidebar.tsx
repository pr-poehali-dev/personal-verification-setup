import Icon from '@/components/ui/icon';
import { Employee } from '@/data/store';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  employee: Employee;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'profile', label: 'Личный кабинет', icon: 'UserCircle' },
  { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowDownCircle' },
  { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowUpCircle' },
  { id: 'transfer', label: 'Переводы', icon: 'ArrowLeftRight' },
  { id: 'credits', label: 'Кредит / Рассрочка', icon: 'CreditCard' },
  { id: 'cards', label: 'Управление картами', icon: 'Wallet' },
  { id: 'accounts', label: 'Учёт счетов', icon: 'BookOpen' },
  { id: 'clients', label: 'Клиентская база', icon: 'Users' },
  { id: 'queue', label: 'Электронная очередь', icon: 'ListOrdered' },
  { id: 'history', label: 'История операций', icon: 'Clock' },
  { id: 'analytics', label: 'Отчёты и аналитика', icon: 'BarChart3' },
  { id: 'terminals', label: 'Терминалы Сбер', icon: 'Monitor' },
];

export default function Sidebar({ activeSection, onNavigate, employee, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-border" style={{ background: 'hsl(var(--sber-dark))' }}>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,38%), hsl(145,63%,48%))' }}>
            <Icon name="Shield" size={20} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">АС ЕФС СБОЛ.про</div>
            <div className="text-muted-foreground text-xs">v2.5.1</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all group ${
              activeSection === item.id
                ? 'text-white font-medium border-r-2 border-primary'
                : 'text-muted-foreground hover:text-white hover:bg-secondary'
            }`}
            style={activeSection === item.id ? { background: 'hsla(145,63%,42%,0.12)' } : {}}
          >
            <Icon name={item.icon} size={16} className={activeSection === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-white'} />
            <span className="leading-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,35%), hsl(145,63%,45%))' }}>
            {employee.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{employee.name}</div>
            <div className="text-muted-foreground text-xs truncate">{employee.roleLabel}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
        >
          <Icon name="LogOut" size={14} />
          Выйти из системы
        </button>
      </div>
    </aside>
  );
}