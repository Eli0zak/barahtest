import React from 'react';
import { LogOut, User, Bell, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { state, logout } = useApp();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <h1 className="text-xl font-bold text-gray-900">نظام إدارة المبيعات</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="text-right rtl:text-left">
              <p className="text-sm font-medium text-gray-900">{state.currentUser?.name}</p>
              <p className="text-xs text-gray-500">
                {state.currentUser?.role === 'sales_representative' && 'مندوب مبيعات'}
                {state.currentUser?.role === 'sales_manager' && 'مسؤول مبيعات'}
                {state.currentUser?.role === 'administrator' && 'مدير النظام'}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};