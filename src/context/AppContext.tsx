import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, User, Customer, Deal, Activity, Task, DailyReport, formatCurrency, formatDate } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<any>;
  // Helper functions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'sales_representative' | 'sales_manager';
  }) => Promise<boolean>;
  addCustomer: (customer: Omit<Customer, 'id' | 'firstContactDate' | 'lastUpdateDate'>) => Promise<Customer | null>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  addDeal: (deal: Omit<Deal, 'id' | 'creationDate' | 'lastUpdateDate'>) => Promise<void>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'activityDate'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'creationDate'>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLoginDate'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  generateDailyReport: (salesRepId: string, date: Date, notes?: string) => Promise<void>;
  loadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  currentUser: null,
  customers: [],
  deals: [],
  activities: [],
  tasks: [],
  dailyReports: [],
  users: [],
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? { ...customer, ...action.payload.updates } : customer
        ),
      };
    case 'ADD_DEAL':
      return { ...state, deals: [...state.deals, action.payload] };
    case 'UPDATE_DEAL':
      return {
        ...state,
        deals: state.deals.map(deal =>
          deal.id === action.payload.id ? { ...deal, ...action.payload.updates } : deal
        ),
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'REMOVE_USER':
      return { ...state, users: state.users.filter(user => user.id !== action.payload) };
    case 'ADD_DAILY_REPORT':
      return { ...state, dailyReports: [...state.dailyReports, action.payload] };
    default:
      return state;
  }
}

// Helper function to convert database row to app model
const convertDbToApp = {
  user: (row: any): User => ({
    id: row.id,
    username: row.username,
    role: row.role,
    name: row.name,
    email: row.email,
    createdAt: new Date(row.created_at),
    lastLoginDate: new Date(row.last_login_date || row.created_at),
    createdByUserId: row.created_by_user_id,
    isActive: row.is_active,
  }),
  customer: (row: any): Customer => ({
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number,
    customerStatus: row.customer_status || 'new_client',
    firstContactDate: new Date(row.first_contact_date),
    lastUpdateDate: new Date(row.last_update_date),
    createdByUserId: row.created_by_user_id,
    assignedSalesRepId: row.assigned_sales_rep_id,
  }),
  deal: (row: any): Deal => ({
    id: row.id,
    customerId: row.customer_id,
    service: row.service,
    leadSource: row.lead_source,
    salesRepresentativeId: row.sales_representative_id,
    status: row.status,
    dealDetails: row.deal_details,
    dealValue: row.deal_value,
    creationDate: new Date(row.creation_date),
    lastUpdateDate: new Date(row.last_update_date),
  }),
  activity: (row: any): Activity => ({
    id: row.id,
    customerId: row.customer_id,
    dealId: row.deal_id,
    activityDate: new Date(row.activity_date),
    activityDetails: row.activity_details,
    activityType: row.activity_type,
    recordedByUserId: row.recorded_by_user_id,
  }),
  task: (row: any): Task => ({
    id: row.id,
    customerId: row.customer_id,
    dealId: row.deal_id,
    assignedToUserId: row.assigned_to_user_id,
    taskDescription: row.task_description,
    dueDate: new Date(row.due_date),
    taskStatus: row.task_status,
    taskType: row.task_type,
    creationDate: new Date(row.creation_date),
    completedDate: row.completed_date ? new Date(row.completed_date) : undefined,
    createdByUserId: row.created_by_user_id,
  }),
  dailyReport: (row: any): DailyReport => ({
    id: row.id,
    reportDate: new Date(row.report_date),
    salesRepresentativeId: row.sales_representative_id,
    newCustomersCount: row.new_customers_count,
    completedDealsCount: row.completed_deals_count,
    totalRevenueFromCompletedDeals: row.total_revenue_from_completed_deals,
    dailyNotes: row.daily_notes,
  }),
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from Supabase
  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const [usersRes, customersRes, dealsRes, activitiesRes, tasksRes, reportsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('deals').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('daily_reports').select('*'),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (customersRes.error) throw customersRes.error;
      if (dealsRes.error) throw dealsRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (reportsRes.error) throw reportsRes.error;

      dispatch({
        type: 'SET_DATA',
        payload: {
          users: usersRes.data?.map(convertDbToApp.user) || [],
          customers: customersRes.data?.map(convertDbToApp.customer) || [],
          deals: dealsRes.data?.map(convertDbToApp.deal) || [],
          activities: activitiesRes.data?.map(convertDbToApp.activity) || [],
          tasks: tasksRes.data?.map(convertDbToApp.task) || [],
          dailyReports: reportsRes.data?.map(convertDbToApp.dailyReport) || [],
        },
      });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في تحميل البيانات' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };


  // Initialize data on app start
  useEffect(() => {
    loadData();
  }, []);

  // Helper functions
  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true);

      if (error) {
        console.error('Supabase error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'خطأ في الاتصال بقاعدة البيانات' });
        return false;
      }

      if (!data || data.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        return false;
      }

      const userData = data[0];

      // Update last login date
      await supabase
        .from('users')
        .update({ last_login_date: new Date().toISOString() })
        .eq('id', userData.id);

      const user = convertDbToApp.user(userData);
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      dispatch({ type: 'SET_ERROR', payload: null });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في تسجيل الدخول' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (userData: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'sales_representative' | 'sales_manager';
  }): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', userData.username)
        .single();

      if (existingUser) {
        dispatch({ type: 'SET_ERROR', payload: 'اسم المستخدم موجود بالفعل' });
        return false;
      }

      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newUser = convertDbToApp.user(data);
      dispatch({ type: 'ADD_USER', payload: newUser });
      dispatch({ type: 'SET_ERROR', payload: null });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إنشاء الحساب' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'firstContactDate' | 'lastUpdateDate'>): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customerData.name,
          phone_number: customerData.phoneNumber,
          customer_status: customerData.customerStatus || 'new_client',
          created_by_user_id: customerData.createdByUserId,
          assigned_sales_rep_id: customerData.assignedSalesRepId,
        })
        .select()
        .single();

      if (error) throw error;

      const newCustomer = convertDbToApp.customer(data);
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      
      // Auto-generate follow-up task
      await addTask({
        customerId: newCustomer.id,
        assignedToUserId: newCustomer.assignedSalesRepId,
        taskDescription: `متابعة عميل جديد - ${newCustomer.name}`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        taskStatus: 'pending',
        taskType: 'new_customer_followup',
        createdByUserId: state.currentUser?.id || '',
      });

      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إضافة العميل' });
      return null;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          phone_number: updates.phoneNumber,
          customer_status: updates.customerStatus,
          last_update_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const updatedData = { ...updates, lastUpdateDate: new Date() };
      dispatch({ type: 'UPDATE_CUSTOMER', payload: { id, updates: updatedData } });
    } catch (error) {
      console.error('Error updating customer:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في تحديث العميل' });
    }
  };

  const addDeal = async (dealData: Omit<Deal, 'id' | 'creationDate' | 'lastUpdateDate'>) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          customer_id: dealData.customerId,
          service: dealData.service,
          lead_source: dealData.leadSource,
          sales_representative_id: dealData.salesRepresentativeId,
          status: dealData.status || 'follow_up_1',
          deal_details: dealData.dealDetails,
          deal_value: dealData.dealValue,
        })
        .select()
        .single();

      if (error) throw error;

      const newDeal = convertDbToApp.deal(data);
      dispatch({ type: 'ADD_DEAL', payload: newDeal });
    } catch (error) {
      console.error('Error adding deal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إضافة الصفقة' });
    }
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          customer_id: updates.customerId,
          service: updates.service,
          lead_source: updates.leadSource,
          sales_representative_id: updates.salesRepresentativeId,
          status: updates.status,
          deal_details: updates.dealDetails,
          deal_value: updates.dealValue,
          last_update_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      const updatedData = { ...updates, lastUpdateDate: new Date() };
      dispatch({ type: 'UPDATE_DEAL', payload: { id, updates: updatedData } });
    } catch (error) {
      console.error('Error updating deal:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في تحديث الصفقة' });
    }
  };

  const addActivity = async (activityData: Omit<Activity, 'id' | 'activityDate'>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          customer_id: activityData.customerId,
          deal_id: activityData.dealId,
          activity_details: activityData.activityDetails,
          activity_type: activityData.activityType,
          recorded_by_user_id: activityData.recordedByUserId,
        })
        .select()
        .single();

      if (error) throw error;

      const newActivity = convertDbToApp.activity(data);
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
    } catch (error) {
      console.error('Error adding activity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إضافة النشاط' });
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'creationDate'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          customer_id: taskData.customerId,
          deal_id: taskData.dealId,
          assigned_to_user_id: taskData.assignedToUserId,
          task_description: taskData.taskDescription,
          due_date: taskData.dueDate.toISOString(),
          task_status: taskData.taskStatus || 'pending',
          task_type: taskData.taskType,
          created_by_user_id: taskData.createdByUserId,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask = convertDbToApp.task(data);
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      console.error('Error adding task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إضافة المهمة' });
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          task_status: 'completed',
          completed_date: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          id: taskId,
          updates: { taskStatus: 'completed', completedDate: new Date() },
        },
      });
    } catch (error) {
      console.error('Error completing task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إكمال المهمة' });
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLoginDate'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          created_by_user_id: userData.createdByUserId,
          is_active: userData.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      const newUser = convertDbToApp.user(data);
      dispatch({ type: 'ADD_USER', payload: newUser });
    } catch (error) {
      console.error('Error adding user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في إضافة المستخدم' });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Delete daily reports
      let { error } = await supabase.from('daily_reports').delete().eq('sales_representative_id', userId);
      if (error) throw error;

      // Delete tasks assigned to or created by user
      ({ error } = await supabase.from('tasks').delete().or(`assigned_to_user_id.eq.${userId},created_by_user_id.eq.${userId}`));
      if (error) throw error;

      // Delete activities recorded by user
      ({ error } = await supabase.from('activities').delete().eq('recorded_by_user_id', userId));
      if (error) throw error;

      // Delete deals where user is sales representative
      ({ error } = await supabase.from('deals').delete().eq('sales_representative_id', userId));
      if (error) throw error;

      // Delete customers created by or assigned to user
      ({ error } = await supabase.from('customers').delete().or(`created_by_user_id.eq.${userId},assigned_sales_rep_id.eq.${userId}`));
      if (error) throw error;

      // Delete user
      ({ error } = await supabase.from('users').delete().eq('id', userId));
      if (error) throw error;

      // Update state
      dispatch({ type: 'REMOVE_USER', payload: userId });

      // Reload data to refresh other related state
      await loadData();

      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error deleting user:', error);
      dispatch({ type: 'SET_ERROR', payload: 'خطأ في حذف المستخدم' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Initialize data on app start
  useEffect(() => {
    loadData();
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    signup,
    addCustomer,
    updateCustomer,
    addDeal,
    updateDeal,
    addActivity,
    addTask,
    completeTask,
    addUser,
    deleteUser,
    generateDailyReport,
    loadData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
