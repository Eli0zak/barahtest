// Core Types for the CRM System
export interface User {
  id: string;
  username: string;
  role: 'sales_representative' | 'sales_manager' | 'administrator';
  name: string;
  email: string;
  createdAt: Date;
  lastLoginDate: Date;
  createdByUserId?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  customerStatus: 'new_client' | 'follow_up' | 'completed';
  firstContactDate: Date;
  lastUpdateDate: Date;
  reminderDate?: Date;
  createdByUserId: string;
  assignedSalesRepId: string;
}

export interface Deal {
  id: string;
  customerId: string;
  service: string;
  leadSource: string;
  salesRepresentativeId: string;
  status: 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'completed' | 'lost';
  dealDetails: string;
  dealValue: number;
  creationDate: Date;
  lastUpdateDate: Date;
}

export interface Activity {
  id: string;
  customerId?: string;
  dealId?: string;
  activityDate: Date;
  activityDetails: string;
  activityType: 'follow_up' | 'call' | 'meeting' | 'email' | 'note';
  recordedByUserId: string;
}

export interface Task {
  id: string;
  customerId?: string;
  dealId?: string;
  assignedToUserId: string;
  taskDescription: string;
  dueDate: Date;
  taskStatus: 'pending' | 'completed' | 'overdue';
  taskType: 'new_customer_followup' | 'inactivity_alert' | 'scheduled_followup' | 'manager_assigned';
  creationDate: Date;
  completedDate?: Date;
  createdByUserId: string;
}

export interface DailyReport {
  id: string;
  reportDate: Date;
  salesRepresentativeId: string;
  newCustomersCount: number;
  completedDealsCount: number;
  totalRevenueFromCompletedDeals: number;
  dailyNotes: string;
}

// UI State Types
export interface AppState {
  currentUser: User | null;
  customers: Customer[];
  deals: Deal[];
  activities: Activity[];
  tasks: Task[];
  dailyReports: DailyReport[];
  users: User[];
  loading: boolean;
  error: string | null;
}

// Form Types
export interface CustomerForm {
  name: string;
  phoneNumber: string;
  customerStatus?: 'new_client' | 'follow_up' | 'completed';
  reminderDate?: string;
}

export interface DealForm {
  customerId: string;
  service: string;
  leadSource: string;
  dealDetails: string;
  dealValue: number;
  status: 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'completed' | 'lost';
  // For inline customer creation
  createNewCustomer?: boolean;
  newCustomerName?: string;
  newCustomerPhone?: string;
}

export interface UserForm {
  username: string;
  password: string;
  role: 'sales_representative' | 'sales_manager';
  name: string;
  email: string;
}

// Filter Types
export interface CustomerFilters {
  search: string;
  assignedSalesRep: string;
  customerStatus: string;
}

export interface DealFilters {
  search: string;
  status: string;
  service: string;
  salesRep: string;
}

export interface TaskFilters {
  status: string;
  type: string;
  assignedTo: string;
}

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(date);
};

export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
