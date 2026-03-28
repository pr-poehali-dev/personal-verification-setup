// Глобальное хранилище данных банковской системы АС ЕФС СБОЛ.про

export type UserRole = 'admin' | 'senior_operator' | 'operator' | 'cashier' | 'client';

export interface Employee {
  id: string;
  identifier: string;
  password: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  phone: string;
  email: string;
}

export interface Client {
  id: string;
  fullName: string;
  passport: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  createdAt: string;
  accounts: string[];
  cards: string[];
}

export interface Account {
  id: string;
  accountNumber: string;
  clientId: string;
  clientName: string;
  balance: number;
  currency: string;
  type: 'checking' | 'savings' | 'credit' | 'deposit';
  typeLabel: string;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
}

export interface Card {
  id: string;
  cardNumber: string;
  clientId: string;
  clientName: string;
  accountId: string;
  expiryDate: string;
  status: 'active' | 'blocked' | 'expired';
  type: 'debit' | 'credit';
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'cash_out' | 'cash_in' | 'transfer' | 'credit' | 'card_issue';
  typeLabel: string;
  amount: number;
  currency: string;
  accountFrom?: string;
  accountTo?: string;
  clientId: string;
  clientName: string;
  operatorId: string;
  operatorName: string;
  status: 'completed' | 'pending' | 'cancelled' | 'error';
  date: string;
  description: string;
  okudCode?: string;
}

export interface QueueTicket {
  id: string;
  ticketNumber: string;
  clientName: string;
  phone: string;
  operationType: string;
  operationCode: string;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
  createdAt: string;
  windowNumber?: number;
}

export interface Credit {
  id: string;
  clientId: string;
  clientName: string;
  passport: string;
  amount: number;
  term: number;
  rate: number;
  accountId: string;
  status: 'active' | 'closed' | 'overdue';
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  paidAmount: number;
  type: 'credit' | 'installment';
  typeLabel: string;
}

export interface Terminal {
  id: string;
  ipAddress: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  lastPing: string;
}

const STORAGE_KEY = 'sberlpro_data';

interface AppData {
  employees: Employee[];
  clients: Client[];
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  queue: QueueTicket[];
  credits: Credit[];
  terminals: Terminal[];
}

const defaultData: AppData = {
  employees: [
    {
      id: 'emp1',
      identifier: 'varikabank',
      password: 'ural',
      name: 'Вадим Иванов',
      role: 'senior_operator',
      roleLabel: 'Старший операционист',
      department: 'Операционный отдел',
      phone: '+7 (999) 100-01-01',
      email: 'v.ivanov@sberpro.ru',
    },
    {
      id: 'emp2',
      identifier: 'timasber',
      password: '11062014',
      name: 'Шевченко Тимофей',
      role: 'operator',
      roleLabel: 'Операционист',
      department: 'Операционный отдел',
      phone: '+7 (999) 200-02-02',
      email: 't.shevchenko@sberpro.ru',
    },
    {
      id: 'emp3',
      identifier: 'sber_op1',
      password: 'sber2024',
      name: 'Сотрудник Сбер 1',
      role: 'operator',
      roleLabel: 'Операционист',
      department: 'Кассовый отдел',
      phone: '+7 (999) 300-03-01',
      email: 'op1@sberpro.ru',
    },
    {
      id: 'emp4',
      identifier: 'sber_op2',
      password: 'sber2024',
      name: 'Сотрудник Сбер 2',
      role: 'cashier',
      roleLabel: 'Кассир',
      department: 'Кассовый отдел',
      phone: '+7 (999) 300-03-02',
      email: 'op2@sberpro.ru',
    },
    {
      id: 'emp5',
      identifier: 'sber_op3',
      password: 'sber2024',
      name: 'Сотрудник Сбер 3',
      role: 'operator',
      roleLabel: 'Операционист',
      department: 'Кредитный отдел',
      phone: '+7 (999) 300-03-03',
      email: 'op3@sberpro.ru',
    },
    {
      id: 'emp6',
      identifier: 'sber_op4',
      password: 'sber2024',
      name: 'Сотрудник Сбер 4',
      role: 'cashier',
      roleLabel: 'Кассир',
      department: 'Кассовый отдел',
      phone: '+7 (999) 300-03-04',
      email: 'op4@sberpro.ru',
    },
    {
      id: 'emp7',
      identifier: 'sber_op5',
      password: 'sber2024',
      name: 'Сотрудник Сбер 5',
      role: 'operator',
      roleLabel: 'Операционист',
      department: 'Отдел карт',
      phone: '+7 (999) 300-03-05',
      email: 'op5@sberpro.ru',
    },
  ],
  clients: [
    {
      id: 'cli1',
      fullName: 'Иванова Мария Сергеевна',
      passport: '4520 123456',
      phone: '+7 (916) 555-11-22',
      email: 'ivanova@mail.ru',
      birthDate: '1985-03-15',
      address: 'г. Москва, ул. Ленина, д.10',
      createdAt: '2024-01-10',
      accounts: ['acc1', 'acc2'],
      cards: ['crd1'],
    },
    {
      id: 'cli2',
      fullName: 'Петров Александр Николаевич',
      passport: '4521 654321',
      phone: '+7 (916) 444-33-55',
      email: 'petrov@gmail.com',
      birthDate: '1990-07-22',
      address: 'г. Москва, пр. Мира, д.55',
      createdAt: '2024-02-05',
      accounts: ['acc3'],
      cards: [],
    },
  ],
  accounts: [
    {
      id: 'acc1',
      accountNumber: '40817810000000000001',
      clientId: 'cli1',
      clientName: 'Иванова Мария Сергеевна',
      balance: 150000,
      currency: 'RUB',
      type: 'checking',
      typeLabel: 'Текущий',
      status: 'active',
      createdAt: '2024-01-10',
    },
    {
      id: 'acc2',
      accountNumber: '40817810000000000002',
      clientId: 'cli1',
      clientName: 'Иванова Мария Сергеевна',
      balance: 500000,
      currency: 'RUB',
      type: 'savings',
      typeLabel: 'Сберегательный',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: 'acc3',
      accountNumber: '40817810000000000003',
      clientId: 'cli2',
      clientName: 'Петров Александр Николаевич',
      balance: 75000,
      currency: 'RUB',
      type: 'checking',
      typeLabel: 'Текущий',
      status: 'active',
      createdAt: '2024-02-05',
    },
  ],
  cards: [
    {
      id: 'crd1',
      cardNumber: '4276 8100 0000 0001',
      clientId: 'cli1',
      clientName: 'Иванова Мария Сергеевна',
      accountId: 'acc1',
      expiryDate: '12/27',
      status: 'active',
      type: 'debit',
      createdAt: '2024-01-10',
    },
  ],
  transactions: [
    {
      id: 'txn1',
      type: 'cash_out',
      typeLabel: 'Выдача наличных',
      amount: 50000,
      currency: 'RUB',
      accountFrom: '40817810000000000001',
      clientId: 'cli1',
      clientName: 'Иванова Мария Сергеевна',
      operatorId: 'emp1',
      operatorName: 'Вадим Иванов',
      status: 'completed',
      date: '2025-03-28T10:15:00',
      description: 'Выдача наличных по требованию клиента',
      okudCode: '0402009',
    },
    {
      id: 'txn2',
      type: 'cash_in',
      typeLabel: 'Взнос наличных',
      amount: 30000,
      currency: 'RUB',
      accountTo: '40817810000000000001',
      clientId: 'cli1',
      clientName: 'Иванова Мария Сергеевна',
      operatorId: 'emp2',
      operatorName: 'Шевченко Тимофей',
      status: 'completed',
      date: '2025-03-27T14:30:00',
      description: 'Взнос наличных от клиента',
      okudCode: '0402008',
    },
  ],
  queue: [],
  credits: [],
  terminals: [
    {
      id: 'trm1',
      ipAddress: '192.168.1.101',
      name: 'Терминал №1',
      location: 'Касса 1',
      status: 'online',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'trm2',
      ipAddress: '192.168.1.102',
      name: 'Терминал №2',
      location: 'Касса 2',
      status: 'offline',
      lastPing: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    // merge with default employees to always have system employees
    const savedIds = parsed.employees?.map((e: Employee) => e.id) || [];
    const missingEmployees = defaultData.employees.filter(e => !savedIds.includes(e.id));
    return {
      ...defaultData,
      ...parsed,
      employees: [...(parsed.employees || []), ...missingEmployees],
    };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function generateAccountNumber(): string {
  const base = '40817810';
  const num = Math.floor(Math.random() * 999999999999).toString().padStart(12, '0');
  return base + num;
}

export function generateCardNumber(): string {
  const groups = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9000 + 1000));
  return `4276 ${groups[1]} ${groups[2]} ${groups[3]}`;
}

export function generateTicketCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${letter}${num}`;
}

export function formatMoney(amount: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
