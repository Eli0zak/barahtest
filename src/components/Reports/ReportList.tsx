import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatShortDate } from '../../types';

export const ReportList: React.FC = () => {
  const { state, generateDailyReport } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSalesRep, setSelectedSalesRep] = useState('');
  const [dailyNotes, setDailyNotes] = useState('');

  const { currentUser, users, customers, deals, dailyReports } = state;

  const salesReps = users.filter(u => u.role === 'sales_representative');

  const generateReport = () => {
    const date = new Date(selectedDate);
    let salesRepIdToUse = selectedSalesRep;

    if (currentUser?.role === 'sales_representative') {
      salesRepIdToUse = currentUser.id;
    } else if (!salesRepIdToUse && salesReps.length > 0) {
      salesRepIdToUse = salesReps[0].id;
    }
    
    if (salesRepIdToUse) {
      generateDailyReport(salesRepIdToUse, date, dailyNotes);
      setDailyNotes('');
    }
  };

  const getReportsForDate = (date: string) => {
    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);
    
    return dailyReports.filter(report => {
      const rDate = new Date(report.reportDate);
      rDate.setHours(0, 0, 0, 0);
      return rDate.getTime() === reportDate.getTime();
    });
  };

  const getTotalStats = () => {
    const completedDeals = deals.filter(d => d.status === 'completed');
    const totalRevenue = completedDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
    
    return {
      totalCustomers: customers.length,
      totalDeals: deals.length,
      completedDeals: completedDeals.length,
      totalRevenue,
    };
  };

  const getSalesRepName = (salesRepId: string) => {
    const salesRep = users.find(u => u.id === salesRepId);
    return salesRep?.name || 'غير محدد';
  };

  const getReportDetails = (report: typeof dailyReports[0]) => {
    const reportDate = new Date(report.reportDate);
    const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

    const newCustomers = customers.filter(
      c => c.assignedSalesRepId === report.salesRepresentativeId &&
           new Date(c.firstContactDate) >= startOfDay &&
           new Date(c.firstContactDate) <= endOfDay
    );

    const completedDeals = deals.filter(
      d => d.salesRepresentativeId === report.salesRepresentativeId &&
           d.status === 'completed' &&
           new Date(d.lastUpdateDate) >= startOfDay &&
           new Date(d.lastUpdateDate) <= endOfDay
    );

    return { newCustomers, completedDeals };
  };

  const stats = getTotalStats();
  const todaysReports = getReportsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الصفقات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الصفقات المكتملة</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedDeals}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Reports Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">التقارير اليومية</h2>
        </div>
        
        <div className="p-6">
          {/* Report Generation Controls */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {currentUser?.role !== 'sales_representative' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مندوب المبيعات
                  </label>
                  <select
                    value={selectedSalesRep}
                    onChange={(e) => setSelectedSalesRep(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر مندوب المبيعات</option>
                    {salesReps.map(rep => (
                      <option key={rep.id} value={rep.id}>{rep.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={currentUser?.role === 'sales_representative' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات التقرير
                </label>
                <textarea
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="أضف ملاحظات هنا..."
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={generateReport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                إنشاء التقرير
              </button>
            </div>
          </div>

          {/* Reports Display */}
          <div className="space-y-4">
            {todaysReports.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد تقارير</h3>
                <p className="mt-1 text-sm text-gray-500">
                  لا توجد تقارير للتاريخ المحدد
                </p>
              </div>
            ) : (
              todaysReports.map((report) => {
                const { newCustomers, completedDeals } = getReportDetails(report);
                return (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        تقرير {getSalesRepName(report.salesRepresentativeId)}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatShortDate(report.reportDate)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{report.newCustomersCount}</div>
                        <div className="text-sm text-gray-600">عملاء جدد</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{report.completedDealsCount}</div>
                        <div className="text-sm text-gray-600">صفقات مكتملة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(report.totalRevenueFromCompletedDeals)}
                        </div>
                        <div className="text-sm text-gray-600">إجمالي الإيرادات</div>
                      </div>
                    </div>
                    
                    {report.dailyNotes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">الملاحظات اليومية:</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{report.dailyNotes}</p>
                      </div>
                    )}

                    {/* Detailed Lists for Manager */}
                    {currentUser?.role !== 'sales_representative' && (
                      <div className="space-y-4">
                        {newCustomers.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">العملاء الجدد</h4>
                            <ul className="divide-y divide-gray-200">
                              {newCustomers.map(c => (
                                <li key={c.id} className="py-2 flex justify-between items-center">
                                  <span>{c.name} ({c.phoneNumber})</span>
                                  {/* Placeholder for view details button */}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {completedDeals.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">الصفقات المكتملة</h4>
                            <ul className="divide-y divide-gray-200">
                              {completedDeals.map(d => (
                                <li key={d.id} className="py-2 flex justify-between items-center">
                                  <span>{d.service} - {formatCurrency(d.dealValue)}</span>
                                  {/* Placeholder for view details button */}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sales Rep Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">أداء مندوبي المبيعات</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {salesReps.map((rep) => {
              const repCustomers = customers.filter(c => c.assignedSalesRepId === rep.id);
              const repDeals = deals.filter(d => d.salesRepresentativeId === rep.id);
              const repCompletedDeals = repDeals.filter(d => d.status === 'completed');
              const repRevenue = repCompletedDeals.reduce((sum, deal) => sum + deal.dealValue, 0);

              return (
                <div key={rep.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{rep.name}</h3>
                    <span className="text-sm text-gray-500">{rep.email}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">{repCustomers.length}</div>
                      <div className="text-sm text-gray-600">عملاء</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">{repDeals.length}</div>
                      <div className="text-sm text-gray-600">صفقات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple-600">{repCompletedDeals.length}</div>
                      <div className="text-sm text-gray-600">صفقات مكتملة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-yellow-600">{formatCurrency(repRevenue)}</div>
                      <div className="text-sm text-gray-600">إيرادات</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
