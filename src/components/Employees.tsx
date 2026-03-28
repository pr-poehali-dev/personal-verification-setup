import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { loadData, saveData, generateId, Employee, UserRole } from '@/data/store';
import { useToast } from '@/hooks/use-toast';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Администратор' },
  { value: 'senior_operator', label: 'Старший операционист' },
  { value: 'operator', label: 'Операционист' },
  { value: 'cashier', label: 'Кассир' },
];

const DEPARTMENTS = [
  'Операционный отдел',
  'Кассовый отдел',
  'Кредитный отдел',
  'Отдел карт',
  'ИТ-отдел',
  'Служба безопасности',
];

const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  admin:            { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  senior_operator:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  operator:         { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  cashier:          { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
};

interface EmployeeFormState {
  name: string;
  identifier: string;
  password: string;
  role: UserRole;
  department: string;
  phone: string;
  email: string;
}

const emptyForm: EmployeeFormState = {
  name: '', identifier: '', password: '', role: 'operator',
  department: 'Операционный отдел', phone: '', email: '',
};

export default function Employees() {
  const { toast } = useToast();
  const [data, setData] = useState(loadData);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = () => setData(loadData());
  const set = (k: keyof EmployeeFormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = loadData();

    // Проверка уникальности идентификатора
    const duplicate = d.employees.find(
      emp => emp.identifier === form.identifier.trim() && emp.id !== editId
    );
    if (duplicate) {
      toast({ title: 'Ошибка', description: 'Идентификатор уже занят другим сотрудником', variant: 'destructive' });
      return;
    }

    const roleLabel = ROLES.find(r => r.value === form.role)?.label || form.role;

    if (editId) {
      // Редактирование
      const i = d.employees.findIndex(emp => emp.id === editId);
      if (i !== -1) {
        d.employees[i] = { ...d.employees[i], ...form, roleLabel };
        saveData(d);
        toast({ title: '✅ Сотрудник обновлён', description: form.name });
      }
      setEditId(null);
    } else {
      // Добавление
      const emp: Employee = {
        id: generateId(),
        identifier: form.identifier.trim(),
        password: form.password,
        name: form.name,
        role: form.role,
        roleLabel,
        department: form.department,
        phone: form.phone,
        email: form.email,
      };
      d.employees.push(emp);
      saveData(d);
      toast({ title: '✅ Сотрудник добавлен', description: `${emp.name} · ${emp.identifier}` });
    }

    setForm(emptyForm);
    setShowAdd(false);
    refresh();
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      name: emp.name, identifier: emp.identifier, password: emp.password,
      role: emp.role, department: emp.department, phone: emp.phone, email: emp.email,
    });
    setEditId(emp.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (empId: string) => {
    const d = loadData();
    d.employees = d.employees.filter(e => e.id !== empId);
    saveData(d);
    setConfirmDelete(null);
    toast({ title: 'Сотрудник удалён' });
    refresh();
  };

  const handleCancel = () => {
    setShowAdd(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const filtered = data.employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.identifier.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#f0fdf4' }}>
            <Icon name="UserCog" size={20} style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Сотрудники</h1>
            <p className="text-muted-foreground text-xs">{data.employees.length} сотрудников в системе</p>
          </div>
        </div>
        {!showAdd && (
          <button
            onClick={() => { setShowAdd(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-all glow-green-sm"
            style={{ background: 'hsl(var(--primary))' }}
          >
            <Icon name="UserPlus" size={16} />
            Добавить сотрудника
          </button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {showAdd && (
        <div className="sber-card p-6 mb-6 animate-scale-in border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Icon name={editId ? 'UserCog' : 'UserPlus'} size={16} style={{ color: 'hsl(var(--primary))' }} />
              {editId ? 'Редактировать сотрудника' : 'Новый сотрудник'}
            </h2>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ФИО */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Имя в системе (ФИО)
              </label>
              <input
                type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="sber-input w-full" placeholder="Иванов Вадим Петрович" required
              />
            </div>

            {/* Идентификатор */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Идентификатор для входа
              </label>
              <div className="relative">
                <Icon name="AtSign" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" value={form.identifier}
                  onChange={e => set('identifier', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="sber-input w-full pl-9 font-mono" placeholder="ivanov_sber" required
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Пароль
              </label>
              <div className="relative">
                <Icon name="KeyRound" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="sber-input w-full pl-9 pr-10" placeholder="Пароль" required
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={14} />
                </button>
              </div>
            </div>

            {/* Роль */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Роль
              </label>
              <select
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className="sber-input w-full bg-white"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Отдел */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Отдел
              </label>
              <select
                value={form.department}
                onChange={e => set('department', e.target.value)}
                className="sber-input w-full bg-white"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Телефон
              </label>
              <div className="relative">
                <Icon name="Phone" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="sber-input w-full pl-9" placeholder="+7 (999) 000-00-00"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Icon name="Mail" size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="sber-input w-full pl-9" placeholder="employee@sberpro.ru"
                />
              </div>
            </div>

            {/* Кнопки */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={handleCancel}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:bg-secondary transition-colors">
                Отмена
              </button>
              <button type="submit"
                className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all"
                style={{ background: 'hsl(var(--primary))' }}>
                {editId ? 'Сохранить изменения' : 'Добавить сотрудника'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Поиск */}
      <div className="mb-4">
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="sber-input w-full pl-10 bg-white"
            placeholder="Поиск по имени, идентификатору, отделу..."
          />
        </div>
      </div>

      {/* Список сотрудников */}
      <div className="sber-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <div className="col-span-3">Сотрудник</div>
            <div className="col-span-2">Идентификатор</div>
            <div className="col-span-2">Роль</div>
            <div className="col-span-2">Отдел</div>
            <div className="col-span-2">Контакты</div>
            <div className="col-span-1 text-right">Действия</div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            <Icon name="Users" size={32} className="mx-auto mb-3 opacity-30" />
            Сотрудники не найдены
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(emp => {
              const roleStyle = ROLE_COLORS[emp.role] || ROLE_COLORS.operator;
              const isDeleting = confirmDelete === emp.id;
              return (
                <div key={emp.id} className={`px-4 py-3 hover:bg-secondary/30 transition-colors ${isDeleting ? 'bg-red-50' : ''}`}>
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Имя */}
                    <div className="col-span-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'hsl(var(--primary))' }}>
                        {emp.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{emp.name}</span>
                    </div>

                    {/* Идентификатор */}
                    <div className="col-span-2">
                      <code className="text-xs bg-secondary px-2 py-1 rounded font-mono text-foreground/80">
                        {emp.identifier}
                      </code>
                    </div>

                    {/* Роль */}
                    <div className="col-span-2">
                      <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                        style={{ background: roleStyle.bg, color: roleStyle.text, borderColor: roleStyle.border }}>
                        {emp.roleLabel}
                      </span>
                    </div>

                    {/* Отдел */}
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground truncate">{emp.department}</span>
                    </div>

                    {/* Контакты */}
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground truncate">{emp.phone || '—'}</div>
                      <div className="text-xs text-muted-foreground truncate">{emp.email || '—'}</div>
                    </div>

                    {/* Действия */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      {isDeleting ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(emp.id)}
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 font-medium transition-colors">
                            Да
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground hover:bg-border transition-colors">
                            Нет
                          </button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(emp)} title="Редактировать"
                            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Icon name="Pencil" size={13} />
                          </button>
                          <button onClick={() => setConfirmDelete(emp.id)} title="Удалить"
                            className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Icon name="Trash2" size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Подтверждение удаления */}
                  {isDeleting && (
                    <div className="mt-2 text-xs text-red-600 font-medium pl-10">
                      Удалить сотрудника {emp.name}? Это действие необратимо.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Итого */}
      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        {ROLES.map(r => {
          const count = data.employees.filter(e => e.role === r.value).length;
          const style = ROLE_COLORS[r.value];
          return count > 0 ? (
            <span key={r.value} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: style.text }} />
              {r.label}: {count}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
}
