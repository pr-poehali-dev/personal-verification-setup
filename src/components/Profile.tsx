import Icon from '@/components/ui/icon';
import { Employee, formatDate } from '@/data/store';

interface ProfileProps { employee: Employee; }

export default function Profile({ employee }: ProfileProps) {
  const stats = [
    { label: 'Идентификатор', value: employee.identifier, icon: 'Fingerprint' },
    { label: 'Роль', value: employee.roleLabel, icon: 'Shield' },
    { label: 'Отдел', value: employee.department, icon: 'Building2' },
    { label: 'Телефон', value: employee.phone, icon: 'Phone' },
    { label: 'Email', value: employee.email, icon: 'Mail' },
  ];

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsla(145,63%,42%,0.15)' }}>
          <Icon name="UserCircle" size={20} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-white">Личный кабинет</h1>
      </div>

      <div className="sber-card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(145,63%,35%), hsl(145,63%,45%))' }}>
            {employee.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
            <p className="text-primary font-medium">{employee.roleLabel}</p>
            <p className="text-muted-foreground text-sm mt-1">{employee.department}</p>
            <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full w-fit text-xs" style={{ background: 'hsla(145,63%,42%,0.15)', border: '1px solid hsla(145,63%,42%,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary">Сессия активна</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {stats.map(s => (
          <div key={s.label} className="sber-card p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'hsla(145,63%,42%,0.1)' }}>
              <Icon name={s.icon} size={16} className="text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</div>
              <div className="text-white font-medium">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sber-card p-5 mt-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Icon name="Shield" size={16} className="text-primary" />
          Безопасность
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Двухфакторная аутентификация', status: 'Включена', ok: true },
            { label: 'SMS-верификация операций', status: 'Включена', ok: true },
            { label: 'Шифрование данных TLS 1.3', status: 'Активно', ok: true },
            { label: 'PCI DSS соответствие', status: 'Подтверждено', ok: true },
            { label: 'Логирование операций', status: 'Включено', ok: true },
            { label: 'Защита от фрода', status: 'Активна', ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${item.ok ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
