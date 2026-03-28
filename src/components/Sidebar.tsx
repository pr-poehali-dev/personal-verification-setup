import Icon from '@/components/ui/icon';
import { Employee } from '@/data/store';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  employee: Employee;
  onLogout: () => void;
}

const navGroups = [
  {
    label: 'Операции',
    items: [
      { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
      { id: 'cash_out', label: 'Выдача наличных', icon: 'ArrowDownCircle' },
      { id: 'cash_in', label: 'Взнос наличных', icon: 'ArrowUpCircle' },
      { id: 'transfer', label: 'Переводы', icon: 'ArrowLeftRight' },
      { id: 'credits', label: 'Кредит / Рассрочка', icon: 'CreditCard' },
      { id: 'cards', label: 'Карты', icon: 'Wallet' },
    ],
  },
  {
    label: 'Клиенты и счета',
    items: [
      { id: 'clients', label: 'Клиентская база', icon: 'Users' },
      { id: 'accounts', label: 'Учёт счетов', icon: 'BookOpen' },
      { id: 'queue', label: 'Электронная очередь', icon: 'ListOrdered' },
    ],
  },
  {
    label: 'Управление',
    items: [
      { id: 'history', label: 'История операций', icon: 'Clock' },
      { id: 'analytics', label: 'Отчёты', icon: 'BarChart3' },
      { id: 'employees', label: 'Сотрудники', icon: 'UserCog' },
      { id: 'terminals', label: 'Терминалы', icon: 'Monitor' },
    ],
  },
  {
    label: 'Аккаунт',
    items: [
      { id: 'profile', label: 'Личный кабинет', icon: 'UserCircle' },
    ],
  },
];

export default function Sidebar({ activeSection, onNavigate, employee, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'hsl(var(--sidebar-background))' }}>
      {/* Логотип */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(133,45%,18%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10">
            <Icon name="Shield" size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">АС ЕФС СБОЛ.про</div>
            <div className="text-white/50 text-xs">Сбербанк · v2.5.1</div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map(group => (
          <div key={group.label} className="mb-1">
            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/30">
              {group.label}
            </div>
            {group.items.map(item => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all relative ${
                    active ? 'text-white font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={active ? { background: 'rgba(255,255,255,0.12)' } : {}}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white" />
                  )}
                  <Icon
                    name={item.icon}
                    size={16}
                    className={active ? 'text-white' : 'text-white/50'}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Пользователь */}
      <div className="p-4 border-t" style={{ borderColor: 'hsl(133,45%,18%)' }}>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer mb-1" onClick={() => onNavigate('profile')}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            {employee.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-semibold truncate">{employee.name}</div>
            <div className="text-white/50 text-xs truncate">{employee.roleLabel}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Icon name="LogOut" size={13} />
          Выйти из системы
        </button>
      </div>
    </aside>
  );
}
