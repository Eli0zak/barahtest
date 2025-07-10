import React, { useState } from 'react';
import { Check, Clock, AlertCircle, Calendar, User, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskFilters, formatShortDate } from '../../types';

export const TaskList: React.FC = () => {
  const { state, completeTask, addTask } = useApp();
  const [filters, setFilters] = useState<TaskFilters>({
    status: '',
    type: '',
    assignedTo: '',
  });

  const { tasks, customers, deals, users, currentUser } = state;

  const taskTypeLabels = {
    'new_customer_followup': 'متابعة عميل جديد',
    'inactivity_alert': 'تنبيه عدم النشاط',
    'scheduled_followup': 'متابعة مجدولة',
    'manager_assigned': 'مهمة من المدير',
  };

  const statusLabels = {
    'pending': 'معلقة',
    'completed': 'مكتملة',
    'overdue': 'متأخرة',
  };

  // Filter tasks based on user role
  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Role-based filtering
    if (currentUser?.role === 'sales_representative') {
      filteredTasks = filteredTasks.filter(t => t.assignedToUserId === currentUser.id);
    }

    // Status filter
    if (filters.status) {
      filteredTasks = filteredTasks.filter(t => t.taskStatus === filters.status);
    }

    // Type filter
    if (filters.type) {
      filteredTasks = filteredTasks.filter(t => t.taskType === filters.type);
    }

    // Assigned to filter (for managers)
    if (filters.assignedTo && currentUser?.role !== 'sales_representative') {
      filteredTasks = filteredTasks.filter(t => t.assignedToUserId === filters.assignedTo);
    }

    return filteredTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const filteredTasks = getFilteredTasks();

  const getTaskStatusColor = (task: any) => {
    if (task.taskStatus === 'completed') return 'bg-green-100 text-green-800';
    if (new Date(task.dueDate) < new Date()) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getTaskIcon = (task: any) => {
    if (task.taskStatus === 'completed') return <Check className="h-5 w-5 text-green-600" />;
    if (new Date(task.dueDate) < new Date()) return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return null;
    const customer = customers.find(c => c.id === customerId);
    return customer?.name;
  };

  const getDealInfo = (dealId?: string) => {
    if (!dealId) return null;
    const deal = deals.find(d => d.id === dealId);
    return deal ? `${deal.service} - ${deal.dealValue} ريال` : null;
  };

  const getAssignedToName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'غير محدد';
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  const salesReps = users.filter(u => u.role === 'sales_representative');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المهام</h1>
        {currentUser?.role === 'sales_manager' && (
          <button
            onClick={() => {/* Add new task logic */}}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>تعيين مهمة جديدة</span>
          </button>
        )}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المهام المعلقة</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredTasks.filter(t => t.taskStatus === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المهام المتأخرة</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredTasks.filter(t => 
                  t.taskStatus === 'pending' && new Date(t.dueDate) < new Date()
                ).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المهام المكتملة</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredTasks.filter(t => t.taskStatus === 'completed').length}
              </p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأنواع</option>
            {Object.entries(taskTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {currentUser?.role !== 'sales_representative' && (
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع المندوبين</option>
              {salesReps.map(rep => (
                <option key={rep.id} value={rep.id}>{rep.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">قائمة المهام</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0 mt-1">
                    {getTaskIcon(task)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task)}`}>
                        {statusLabels[task.taskStatus]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {taskTypeLabels[task.taskType]}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {task.taskDescription}
                    </h4>
                    <div className="text-xs text-gray-500 space-y-1">
                      {getCustomerName(task.customerId) && (
                        <p>العميل: {getCustomerName(task.customerId)}</p>
                      )}
                      {getDealInfo(task.dealId) && (
                        <p>الصفقة: {getDealInfo(task.dealId)}</p>
                      )}
                      {currentUser?.role !== 'sales_representative' && (
                        <p>المكلف: {getAssignedToName(task.assignedToUserId)}</p>
                      )}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Calendar className="h-3 w-3" />
                        <span>
                          تاريخ الاستحقاق: {formatShortDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {task.taskStatus === 'pending' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-3 w-3 ml-1" />
                      إكمال
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مهام</h3>
            <p className="mt-1 text-sm text-gray-500">
              لا توجد مهام تطابق الفلاتر المحددة
            </p>
          </div>
        )}
      </div>
    </div>
  );
};