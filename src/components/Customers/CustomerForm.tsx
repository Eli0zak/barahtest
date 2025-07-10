import React, { useState, useEffect } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerForm as CustomerFormType, formatDate } from '../../types';

interface CustomerFormProps {
  customerId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customerId, 
  onClose, 
  onSave 
}) => {
  const { state, addCustomer, updateCustomer } = useApp();
  const [formData, setFormData] = useState<CustomerFormType>({
    name: '',
    phoneNumber: '',
    customerStatus: 'new_client',
    reminderDate: '',
  });
  const [errors, setErrors] = useState<Partial<CustomerFormType>>({});
@@ ... @@
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        customerStatus: customer.customerStatus,
      });
    }
  }, [customer]);
import React, { useState, useEffect } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerForm as CustomerFormType, formatDate } from '../../types';

interface CustomerFormProps {
  customerId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customerId, 
  onClose, 
  onSave 
}) => {
  const { state, addCustomer, updateCustomer } = useApp();
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        customerStatus: customer.customerStatus,
        reminderDate: customer.reminderDate ? customer.reminderDate.toISOString().split('T')[0] : '',
      });
    }
  }, [customer]);
@@ ... @@
        <div>
          <label htmlFor="customerStatus" className="block text-sm font-medium text-gray-700 mb-2">
            حالة العميل *
          </label>
          <select
            id="customerStatus"
            value={formData.customerStatus || 'new_client'}
            onChange={(e) => handleChange('customerStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="new_client">عميل جديد</option>
            <option value="follow_up">متابعة</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
import React, { useState, useEffect } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CustomerForm as CustomerFormType, formatDate } from '../../types';

interface CustomerFormProps {
  customerId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ 
  customerId, 
  onClose, 
  onSave 
}) => {
  const { state, addCustomer, updateCustomer } = useApp();
        <div>
          <label htmlFor="customerStatus" className="block text-sm font-medium text-gray-700 mb-2">
            حالة العميل *
          </label>
          <select
            id="customerStatus"
            value={formData.customerStatus || 'new_client'}
            onChange={(e) => handleChange('customerStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="new_client">عميل جديد</option>
            <option value="follow_up">متابعة</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
            تاريخ التذكير
          </label>
          <input
            type="date"
            id="reminderDate"
            value={formData.reminderDate || ''}
            onChange={(e) => handleChange('reminderDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

  const customer = customerId ? state.customers.find(c => c.id === customerId) : null;
  const isEditing = !!customerId;

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        customerStatus: customer.customerStatus,
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormType> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'اسم العميل مطلوب';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'رقم الهاتف مطلوب';
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'رقم الهاتف غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditing && customerId) {
      updateCustomer(customerId, formData);
    } else {
      addCustomer({
        ...formData,
        createdByUserId: state.currentUser?.id || '',
        assignedSalesRepId: state.currentUser?.id || '',
      });
    }

    onSave();
    onClose();
  };

  const handleChange = (field: keyof CustomerFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'تعديل العميل' : 'إضافة عميل جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              اسم العميل *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل اسم العميل"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل رقم الهاتف"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="customerStatus" className="block text-sm font-medium text-gray-700 mb-2">
              حالة العميل *
            </label>
            <select
              id="customerStatus"
              value={formData.customerStatus || 'new_client'}
              onChange={(e) => handleChange('customerStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="new_client">عميل جديد</option>
              <option value="follow_up">متابعة</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'حفظ التغييرات' : 'إضافة العميل'}</span>
            </button>
          </div>
        </form>

        {isEditing && customer && (
          <div className="px-6 pb-4 border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>تاريخ أول تواصل:</strong> {formatDate(customer.firstContactDate)}</p>
              <p><strong>تاريخ آخر تحديث:</strong> {formatDate(customer.lastUpdateDate)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
