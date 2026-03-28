import { useState } from 'react';
import { Employee } from '@/data/store';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Profile from '@/components/Profile';
import CashOut from '@/components/operations/CashOut';
import CashIn from '@/components/operations/CashIn';
import Transfer from '@/components/operations/Transfer';
import Credits from '@/components/operations/Credits';
import Cards from '@/components/operations/Cards';
import Queue from '@/components/Queue';
import Clients from '@/components/Clients';
import Accounts from '@/components/Accounts';
import History from '@/components/History';
import Analytics from '@/components/Analytics';
import Terminals from '@/components/Terminals';
import Employees from '@/components/Employees';
import { Toaster } from '@/components/ui/toaster';

export default function Index() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [section, setSection] = useState('dashboard');

  const handleLogin = (emp: Employee) => {
    setEmployee(emp);
    setSection('dashboard');
  };

  const handleLogout = () => {
    setEmployee(null);
    setSection('dashboard');
  };

  if (!employee) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <Dashboard employee={employee} onNavigate={setSection} />;
      case 'profile': return <Profile employee={employee} />;
      case 'cash_out': return <CashOut employee={employee} />;
      case 'cash_in': return <CashIn employee={employee} />;
      case 'transfer': return <Transfer employee={employee} />;
      case 'credits': return <Credits employee={employee} />;
      case 'cards': return <Cards employee={employee} />;
      case 'accounts': return <Accounts />;
      case 'clients': return <Clients />;
      case 'queue': return <Queue employee={employee} />;
      case 'history': return <History />;
      case 'analytics': return <Analytics />;
      case 'terminals': return <Terminals />;
      case 'employees': return <Employees />;
      default: return <Dashboard employee={employee} onNavigate={setSection} />;
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-background">
        <Sidebar activeSection={section} onNavigate={setSection} employee={employee} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
      <Toaster />
    </>
  );
}