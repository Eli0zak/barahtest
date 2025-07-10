import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { CustomerList } from './components/Customers/CustomerList';
import { CustomerForm } from './components/Customers/CustomerForm';
import { DealList } from './components/Deals/DealList';
import { DealForm } from './components/Deals/DealForm';
import { TaskList } from './components/Tasks/TaskList';
import { ReportList } from './components/Reports/ReportList';
import { UserList } from './components/Users/UserList';

const AppContent: React.FC = () => {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);

  if (!state.currentUser) {
    return <LoginForm />;
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowCustomerForm(true);
  };

  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    setShowDealForm(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomerId(null);
    setShowCustomerForm(true);
  };

  const handleAddDeal = () => {
    setSelectedDealId(null);
    setShowDealForm(true);
  };

  const handleCloseCustomerForm = () => {
    setShowCustomerForm(false);
    setSelectedCustomerId(null);
  };

  const handleCloseDealForm = () => {
    setShowDealForm(false);
    setSelectedDealId(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return (
          <CustomerList
            onCustomerSelect={handleCustomerSelect}
            onAddCustomer={handleAddCustomer}
          />
        );
      case 'deals':
        return (
          <DealList
            onDealSelect={handleDealSelect}
            onAddDeal={handleAddDeal}
          />
        );
      case 'tasks':
        return <TaskList />;
      case 'reports':
        return <ReportList />;
      case 'users':
        return <UserList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
<main className="flex-1 p-6 md:mr-20">
          {renderContent()}
        </main>
      </div>

      {/* Modal Forms */}
      {showCustomerForm && (
        <CustomerForm
          customerId={selectedCustomerId || undefined}
          onClose={handleCloseCustomerForm}
          onSave={() => {}}
        />
      )}

      {showDealForm && (
        <DealForm
          dealId={selectedDealId || undefined}
          onClose={handleCloseDealForm}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;