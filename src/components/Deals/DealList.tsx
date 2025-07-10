import React, { useState } from 'react';
import { Plus, Search, DollarSign, Calendar, User, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DealFilters, formatCurrency, formatShortDate } from '../../types';

interface DealListProps {
  onDealSelect: (dealId: string) => void;
  onAddDeal: () => void;
}

export const DealList: React.FC<DealListProps> = ({ 
  onDealSelect, 
  onAddDeal 
}) => {
  const { state } = useApp();
  const [filters, setFilters] = useState<DealFilters>({
    search: '',
    status: '',
    service: '',
    salesRep: '',
  });

  const { deals, customers, users, currentUser } = state;

  const statusLabels = {
    'follow_up_1': 'متابعة 1',
    'follow_up_2': 'متابعة 2',
    'follow_up_3': 'متابعة 3',
    'completed': 'مكتملة',
    'lost': 'فقدت',
  };

  const statusColors = {
    'follow_up_1': 'bg-yellow-100 text-yellow-800',
    'follow_up_2': 'bg-orange-100 text-orange-800',
    'follow_up_3': 'bg-red-100 text-red-800',
    'completed': 'bg-green-100 text-green-800',
    'lost': 'bg-gray-100 text-gray-800',
  };

  const services = ['ايداعات', 'حجز قاعات', 'مكاتب ادارية'];

  // Filter deals based on user role
  const getFilteredDeals = () => {
    let filteredDeals = deals;

    // Role-based filtering
    if (currentUser?.role === 'sales_representative') {
      filteredDeals = filteredDeals.filter(d => d.salesRepresentativeId === currentUser.id);
    }

    // Search filter
    if (filters.search) {
      filteredDeals = filteredDeals.filter(deal => {
        const customer = customers.find(c => c.id === deal.customerId);
        return customer?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
               deal.service.toLowerCase().includes(filters.search.toLowerCase()) ||
               deal.dealDetails.toLowerCase().includes(filters.search.toLowerCase());
      });
    }

    // Status filter
    if (filters.status) {
      filteredDeals = filteredDeals.filter(d => d.status === filters.status);
    }

    // Service filter
    if (filters.service) {
      filteredDeals = filteredDeals.filter(d => d.service === filters.service);
    }

    // Sales rep filter (for managers)
    if (filters.salesRep && currentUser?.role !== 'sales_representative') {
      filteredDeals = filteredDeals.filter(d => d.salesRepresentativeId === filters.salesRep);
    }

    return filteredDeals;
  };

  const filteredDeals = getFilteredDeals();

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'غير محدد';
  };

  const getSalesRepName = (salesRepId: string) => {
    const salesRep = users.find(u => u.id === salesRepId);
    return salesRep?.name || 'غير محدد';
  };

  const salesReps = users.filter(u => u.role === 'sales_representative');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الصفقات</h1>
        <button
          onClick={onAddDeal}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة صفقة جديدة</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filters.service}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الخدمات</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          {currentUser?.role !== 'sales_representative' && (
            <select
              value={filters.salesRep}
              onChange={(e) => setFilters({ ...filters, salesRep: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع مندوبي المبيعات</option>
              {salesReps.map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Deals List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الخدمة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  قيمة الصفقة
                </th>
                {currentUser?.role !== 'sales_representative' && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    مندوب المبيعات
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getCustomerName(deal.customerId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deal.leadSource}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deal.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[deal.status]}`}>
                      {statusLabels[deal.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="h-4 w-4 ml-2 text-green-600" />
                      {formatCurrency(deal.dealValue)}
                    </div>
                  </td>
                  {currentUser?.role !== 'sales_representative' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSalesRepName(deal.salesRepresentativeId)}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 ml-2" />
                      {formatShortDate(deal.creationDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onDealSelect(deal.id)}
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

        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد صفقات</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search ? 'لا توجد نتائج للبحث المحدد' : 'ابدأ بإضافة صفقة جديدة'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};