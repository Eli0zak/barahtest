import React, { useState } from 'react';
import { Plus, User, Edit, UserCheck, UserX, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatShortDate } from '../../types';

export const UserList: React.FC = () => {
  const { state, addUser, deleteUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'sales_representative' as 'sales_representative' | 'sales_manager',
  });

  const { users, currentUser } = state;

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف المستخدم "${userName}"؟ سيتم حذف جميع البيانات المرتبطة به.`)) {
      await deleteUser(userId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addUser({
      ...formData,
      createdByUserId: currentUser?.id || '',
      isActive: true,
    });

    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'sales_representative',
    });
    setShowAddForm(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sales_representative': return 'مندوب مبيعات';
      case 'sales_manager': return 'مسؤول مبيعات';
      case 'administrator': return 'مدير النظام';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'sales_representative': return 'bg-blue-100 text-blue-800';
      case 'sales_manager': return 'bg-green-100 text-green-800';
      case 'administrator': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مندوبي المبيعات</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'sales_representative').length}
              </p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مسؤولي المبيعات</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'sales_manager').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المستخدمون النشطون</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatShortDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-gray-100 rounded-full"
                        title="تعديل"
                        >
                        <Edit className="h-4 w-4" />
                      </button>
                      {(currentUser?.role === 'sales_manager' || currentUser?.role === 'administrator') && user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-gray-100 rounded-full"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">إضافة مستخدم جديد</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <UserX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستخدم *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'sales_representative' | 'sales_manager' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sales_representative">مندوب مبيعات</option>
                  <option value="sales_manager">مسؤول مبيعات</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
