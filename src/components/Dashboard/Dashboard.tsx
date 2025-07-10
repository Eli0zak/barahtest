import React from 'react';
import { 
  Users, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../types';

// Move StatCard component outside of Dashboard component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1">
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { state } = useApp();
  const { currentUser, customers, deals, tasks } = state;

  // Calculate stats based on current user role
  const getStats = () => {
    if (currentUser?.role === 'sales_representative') {
      const myCustomers = customers.filter(c => c.assignedSalesRepId === currentUser.id);
      const myDeals = deals.filter(d => d.salesRepresentativeId === currentUser.id);
      const myTasks = tasks.filter(t => t.assignedToUserId === currentUser.id);
      const completedDeals = myDeals.filter(d => d.status === 'completed');
      const totalRevenue = completedDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
      const pendingTasks = myTasks.filter(t => t.taskStatus === 'pending');
      const overdueTasks = myTasks.filter(t => 
        t.taskStatus === 'pending' && new Date(t.dueDate) < new Date()
      );

      return {
        totalCustomers: myCustomers.length,
        totalDeals: myDeals.length,
        completedDeals: completedDeals.length,
        totalRevenue,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
      };
    } else {
      // Manager/Admin view
      const completedDeals = deals.filter(d => d.status === 'completed');
      const totalRevenue = completedDeals.reduce((sum, deal) => sum + deal.dealValue, 0);
      const pendingTasks = tasks.filter(t => t.taskStatus === 'pending');
      const overdueTasks = tasks.filter(t => 
        t.taskStatus === 'pending' && new Date(t.dueDate) < new Date()
      );

      return {
        totalCustomers: customers.length,
        totalDeals: deals.length,
        completedDeals: completedDeals.length,
        totalRevenue,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
      };
    }
  };

  const stats = getStats();

  // Get today's tasks
  const todaysTasks = (() => {
    if (!currentUser) return [];

    const today = new Date();
    const todayDateString = today.toDateString();

    // Helper to check if date is exactly one day before today
    const isOneDayBefore = (date: Date) => {
      const oneDayBefore = new Date(today);
      oneDayBefore.setDate(today.getDate() - 1);
      return date.toDateString() === oneDayBefore.toDateString();
    };

    // Helper to check if date is 10 or more days before today
    const isTenDaysBeforeOrMore = (date: Date) => {
      const tenDaysBefore = new Date(today);
      tenDaysBefore.setDate(today.getDate() - 10);
      return date <= tenDaysBefore;
    };

    // Filter customers assigned to current user with status not completed
    const relevantCustomers = customers.filter(c =>
      c.assignedSalesRepId === currentUser.id &&
      c.customerStatus !== 'completed'
    );

    // Customers created exactly one day before today
    const newCustomerTasks = relevantCustomers.filter(c =>
      isOneDayBefore(c.firstContactDate)
    );

    // Customers with reminderDate today
    const reminderTasks = relevantCustomers.filter(c =>
      c.reminderDate && c.reminderDate.toDateString() === todayDateString
    );

    // Customers with no update for 10 days or more
    const inactivityTasks = relevantCustomers.filter(c =>
      isTenDaysBeforeOrMore(c.lastUpdateDate)
    );

    // Combine all customers needing tasks today
    const customersForTasks = [
      ...newCustomerTasks,
      ...reminderTasks,
      ...inactivityTasks,
    ];

    // Remove duplicates by customer id
    const uniqueCustomersMap = new Map<string, typeof customers[0]>();
    customersForTasks.forEach(c => uniqueCustomersMap.set(c.id, c));
    const uniqueCustomers = Array.from(uniqueCustomersMap.values());

    // Map customers to task-like objects for display
    return uniqueCustomers.map(c => ({
      id: c.id,
      taskDescription: `متابعة العميل ${c.name}`,
      assignedToUserId: c.assignedSalesRepId,
      taskStatus: 'pending',
      dueDate: today,
    })).filter(t => t.assignedToUserId === currentUser.id);
  })();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          مرحباً، {currentUser?.name}
        </h1>
        <div className="text-sm text-gray-500">
          {formatDate(new Date())}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="إجمالي الصفقات"
          value={stats.totalDeals}
          icon={<FileText className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="الصفقات المكتملة"
          value={stats.completedDeals}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats.totalRevenue)}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المهام المعلقة</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">المهام المعلقة</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Calendar className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">المهام المتأخرة</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.overdueTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مهام اليوم</h3>
          <div className="space-y-3">
            {todaysTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد مهام لهذا اليوم</p>
            ) : (
              todaysTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-50 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700 flex-1">{task.taskDescription}</span>
                </div>
              ))
            )}
            {todaysTasks.length > 3 && (
              <p className="text-sm text-blue-600 text-center">
                وعدد {todaysTasks.length - 3} مهام أخرى...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الأنشطة الأخيرة</h3>
        <div className="space-y-3">
          {state.activities.slice(0, 5).map((activity) => {
            const customer = customers.find(c => c.id === activity.customerId);
            const deal = deals.find(d => d.id === activity.dealId);
            return (
              <div key={activity.id} className="flex items-center space-x-3 rtl:space-x-reverse py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.activityDetails}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer?.name} - {formatDate(activity.activityDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
