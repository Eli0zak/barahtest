import React, { useState, useEffect } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DealForm as DealFormType, formatCurrency, Deal } from '../../types';

interface DealFormProps {
  dealId?: string;
  onClose: () => void;
  onSave: () => void;
}

export const DealForm: React.FC<DealFormProps> = ({ 
  dealId, 
  onClose, 
  onSave 
}) => {
  const { state, addDeal, updateDeal, addCustomer } = useApp();
  const [formData, setFormData] = useState<DealFormType>({
    customerId: '',
    service: '',
    leadSource: '',
    dealDetails: '',
    dealValue: 0,
    status: 'follow_up_1',
    createNewCustomer: false,
    newCustomerName: '',
    newCustomerPhone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DealFormType, string>>>({});

  const deal = dealId ? state.deals.find(d => d.id === dealId) : null;
  const isEditing = !!dealId;

  const services = ['براح اوبريشن','براح اوفلاين','ِشيردات','تأسيس شركات ','اشتراكات','ايداعات', 'حجز قاعات', 'مكاتب ادارية'];
  const dealStatuses: Deal['status'][] = ['follow_up_1', 'follow_up_2', 'follow_up_3', 'completed', 'lost'];
  const leadSources = ['Facebook', 'Calls', 'Walkin', 'WhatsApp','word of mouth','Other'];

  // Filter customers based on user role
  const getAvailableCustomers = () => {
    if (state.currentUser?.role === 'sales_representative') {
      return state.customers.filter(c => c.assignedSalesRepId === state.currentUser?.id);
    }
    return state.customers;
  };

  const availableCustomers = getAvailableCustomers();

  useEffect(() => {
    if (deal) {
      setFormData(prev => ({
        ...prev,
        customerId: deal.customerId,
        service: deal.service,
        leadSource: deal.leadSource,
        dealDetails: deal.dealDetails,
        dealValue: deal.dealValue,
        status: deal.status,
      }));
    }
  }, [deal]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DealFormType, string>> = {};

    if (!formData.createNewCustomer && !formData.customerId) {
      newErrors.customerId = 'العميل مطلوب';
    }

    if (formData.createNewCustomer) {
      if (!formData.newCustomerName?.trim()) {
        newErrors.newCustomerName = 'اسم العميل مطلوب';
      }
      if (!formData.newCustomerPhone?.trim()) {
        newErrors.newCustomerPhone = 'رقم الهاتف مطلوب';
      }
    }

    if (!formData.service) {
      newErrors.service = 'الخدمة مطلوبة';
    }

    if (!formData.leadSource) {
      newErrors.leadSource = 'مصدر العميل مطلوب';
    }

    if (!formData.dealDetails.trim()) {
      newErrors.dealDetails = 'تفاصيل الصفقة مطلوبة';
    }

    if (formData.dealValue < 0) {
      newErrors.dealValue = 'قيمة الصفقة يجب أن تكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitDeal = async () => {
      let customerId = formData.customerId;

      // Create new customer if needed
      if (formData.createNewCustomer && formData.newCustomerName && formData.newCustomerPhone) {
        const newCustomerData = {
          name: formData.newCustomerName,
          phoneNumber: formData.newCustomerPhone,
          customerStatus: 'new_client' as const,
          createdByUserId: state.currentUser?.id || '',
          assignedSalesRepId: state.currentUser?.id || '',
        };
        
        const newCustomer = await addCustomer(newCustomerData);
        if (newCustomer) {
          customerId = newCustomer.id;
        } else {
          // Handle customer creation failure
          console.error("Failed to create new customer.");
          return;
        }
      }

      const dealData = {
        customerId,
        service: formData.service,
        leadSource: formData.leadSource,
        dealDetails: formData.dealDetails,
        dealValue: formData.dealValue,
        salesRepresentativeId: state.currentUser?.id || '',
        status: formData.status as Deal['status'],
      };

      if (isEditing && dealId) {
        await updateDeal(dealId, dealData);
      } else {
        await addDeal(dealData);
      }

      onSave();
      onClose();
    };

    submitDeal();
  };

  const handleChange = (field: keyof DealFormType, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'تعديل الصفقة' : 'إضافة صفقة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العميل *
            </label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="radio"
                  id="existingCustomer"
                  name="customerType"
                  checked={!formData.createNewCustomer}
                  onChange={() => handleChange('createNewCustomer', false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="existingCustomer" className="text-sm text-gray-700">
                  اختيار عميل موجود
                </label>
              </div>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="radio"
                  id="newCustomer"
                  name="customerType"
                  checked={formData.createNewCustomer}
                  onChange={() => handleChange('createNewCustomer', true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="newCustomer" className="text-sm text-gray-700">
                  إنشاء عميل جديد
                </label>
              </div>
            </div>
            
            {!formData.createNewCustomer ? (
              <div className="mt-3">
                <select
                  value={formData.customerId}
                  onChange={(e) => handleChange('customerId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر العميل</option>
                  {availableCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phoneNumber}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="اسم العميل"
                    value={formData.newCustomerName || ''}
                    onChange={(e) => handleChange('newCustomerName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.newCustomerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.newCustomerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.newCustomerName}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    value={formData.newCustomerPhone || ''}
                    onChange={(e) => handleChange('newCustomerPhone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.newCustomerPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.newCustomerPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.newCustomerPhone}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Deal Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {dealStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'follow_up_1' ? 'متابعة 1' :
                   status === 'follow_up_2' ? 'متابعة 2' :
                   status === 'follow_up_3' ? 'متابعة 3' :
                   status === 'completed' ? 'مكتملة' :
                   'مفقودة'}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>
          
          {/* Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الخدمة *
            </label>
            <select
              value={formData.service}
              onChange={(e) => handleChange('service', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.service ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">اختر الخدمة</option>
              {services.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            {errors.service && (
              <p className="mt-1 text-sm text-red-600">{errors.service}</p>
            )}
          </div>

          {/* Lead Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مصدر العميل *
            </label>
            <select
              value={formData.leadSource}
              onChange={(e) => handleChange('leadSource', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.leadSource ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">اختر مصدر العميل</option>
              {leadSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            {errors.leadSource && (
              <p className="mt-1 text-sm text-red-600">{errors.leadSource}</p>
            )}
          </div>

          {/* Deal Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              قيمة الصفقة (جنيه مصري) *
            </label>
            <input
              type="number"
              value={formData.dealValue}
              onChange={(e) => handleChange('dealValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dealValue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل قيمة الصفقة بالجنيه المصري"
              min="0"
              step="0.01"
            />
            {errors.dealValue && (
              <p className="mt-1 text-sm text-red-600">{errors.dealValue}</p>
            )}
          </div>

          {/* Deal Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تفاصيل الصفقة *
            </label>
            <textarea
              value={formData.dealDetails}
              onChange={(e) => handleChange('dealDetails', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dealDetails ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل تفاصيل الصفقة..."
            />
            {errors.dealDetails && (
              <p className="mt-1 text-sm text-red-600">{errors.dealDetails}</p>
            )}
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
              <span>{isEditing ? 'حفظ التغييرات' : 'إضافة الصفقة'}</span>
            </button>
          </div>
        </form>

        {isEditing && deal && (
          <div className="px-6 pb-4 border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>تاريخ الإنشاء:</strong> {deal.creationDate.toLocaleDateString('ar-EG')}</p>
              <p><strong>تاريخ آخر تحديث:</strong> {deal.lastUpdateDate.toLocaleDateString('ar-EG')}</p>
              <p><strong>قيمة الصفقة:</strong> {formatCurrency(deal.dealValue)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
