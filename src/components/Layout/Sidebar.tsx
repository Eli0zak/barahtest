import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  UserPlus, 
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isOpen, 
  onClose 
}) => {
  const { state } = useApp();
  const userRole = state.currentUser?.role;

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home, roles: ['sales_representative', 'sales_manager', 'administrator'] },
    { id: 'customers', label: 'العملاء', icon: Users, roles: ['sales_representative', 'sales_manager', 'administrator'] },
    { id: 'deals', label: 'الصفقات', icon: FileText, roles: ['sales_representative', 'sales_manager', 'administrator'] },
    { id: 'tasks', label: 'المهام', icon: CheckSquare, roles: ['sales_representative', 'sales_manager', 'administrator'] },
    { id: 'reports', label: 'التقارير', icon: BarChart3, roles: ['sales_manager', 'administrator'] },
    { id: 'users', label: 'إدارة المستخدمين', icon: UserPlus, roles: ['sales_manager', 'administrator'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:shadow-none md:border-l md:border-gray-200
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">القائمة</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="ml-3 h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};