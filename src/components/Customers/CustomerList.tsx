import React, { useState } from 'react';
import { Plus, Search, Phone, Calendar, User, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerFilters, formatShortDate } from '../../types';

interface CustomerListProps {
  onCustomerSelect: (customerId: string) => void;
  onAddCustomer: () => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({ 
  onCustomerSelect, 
  onAddCustomer 
}) => {
  const { state } = useApp();
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    assignedSalesRep: '',
    customerStatus: '',
  });

  const { customers, deals, users, currentUser } = state;

  // Filter customers based on user role
  const getFilteredCustomers = () => {
    let filteredCustomers = customers;

    // Role-based filtering
    if (currentUser?.role === 'sales_representative') {
      filteredCustomers = filteredCustomers.filter(c => c.assignedSalesRepId === currentUser.id);
    }

    // Search filter
    if (filters.search) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phoneNumber.includes(filters.search)
      );
    }

    // Sales rep filter (for managers)
    if (filters.assignedSalesRep && currentUser?.role !== 'sales_representative') {
      filteredCustomers = filteredCustomers.filter(c => c.assignedSalesRepId === filters.assignedSalesRep);
    }

    // Customer status filter
    if (filters.customerStatus) {
      filteredCustomers = filteredCustomers.filter(c => c.customerStatus === filters.customerStatus);
    }

    return filteredCustomers;
  };

  const filteredCustomers = getFilteredCustomers();

  const getCustomerLatestDealStatus = (customerId: string) => {
    const customerDeals = deals.filter(d => d.customerId === customerId);
    if (customerDeals.length === 0) return 'لا توجد صفقات';
    
    const latestDeal = customerDeals.sort((a, b) => 
      new Date(b.lastUpdateDate).getTime() - new Date(a.lastUpdateDate).getTime()
    )[0];
    
    const statusLabels = {
      'follow_up_1': 'متابعة 1',
      'follow_up_2': 'متابعة 2',
      'follow_up_3': 'متابعة 3',
      'completed': 'مكتملة',
      'lost': 'فقدت',
    };
    
    return statusLabels[latestDeal.status] || latestDeal.status;
  };

  const getSalesRepName = (salesRepId: string) => {
    const salesRep = users.find(u => u.id === salesRepId);
    return salesRep?.name || 'غير محدد';
  };

  const getCustomerStatusLabel = (status: string) => {
    const statusLabels = {
      'new_client': 'عميل جديد',
      'follow_up': 'متابعة',
      'completed': 'مكتمل',
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getCustomerStatusColor = (status: string) => {
    const statusColors = {
      'new_client': 'bg-blue-100 text-blue-800',
      'follow_up': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
  };

  const salesReps = users.filter(u => u.role === 'sales_representative');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>
        <button
          onClick={onAddCustomer}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن عميل..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {currentUser?.role !== 'sales_representative' && (
            <select
              value={filters.assignedSalesRep}
              onChange={(e) => setFilters({ ...filters, assignedSalesRep: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع مندوبي المبيعات</option>
              {salesReps.map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
          )}

          <select
            value={filters.customerStatus}
            onChange={(e) => setFilters({ ...filters, customerStatus: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع حالات العملاء</option>
            <option value="new_client">عميل جديد</option>
            <option value="follow_up">متابعة</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  اسم العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  رقم الهاتف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  حالة العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاريخ أول تواصل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  حالة آخر صفقة
                </th>
                {currentUser?.role !== 'sales_representative' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    مندوب المبيعات
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-4 w-4 ml-2" />
                      {customer.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.customerStatus)}`}>
                      {getCustomerStatusLabel(customer.customerStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 ml-2" />
                      {formatShortDate(customer.firstContactDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCustomerLatestDealStatus(customer.id)}
                    </span>
                  </td>
                  {currentUser?.role !== 'sales_representative' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSalesRepName(customer.assignedSalesRepId)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onCustomerSelect(customer.id)}
                      className="text-blue-600 hover:text-blue-900 ml-4"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد عملاء</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ? 'لا توجد نتائج للبحث المحدد' : 'ابدأ بإضافة عميل جديد'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};