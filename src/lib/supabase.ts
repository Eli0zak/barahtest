import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          role: 'sales_representative' | 'sales_manager' | 'administrator'
          name: string
          email: string
          created_at: string
          last_login_date: string | null
          created_by_user_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          username: string
          role: 'sales_representative' | 'sales_manager' | 'administrator'
          name: string
          email: string
          created_at?: string
          last_login_date?: string | null
          created_by_user_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          username?: string
          role?: 'sales_representative' | 'sales_manager' | 'administrator'
          name?: string
          email?: string
          created_at?: string
          last_login_date?: string | null
          created_by_user_id?: string | null
          is_active?: boolean
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone_number: string
          customer_status: 'new_client' | 'follow_up' | 'completed'
          first_contact_date: string
          last_update_date: string
          created_by_user_id: string
          assigned_sales_rep_id: string
        }
        Insert: {
          id?: string
          name: string
          phone_number: string
          customer_status?: 'new_client' | 'follow_up' | 'completed'
          first_contact_date?: string
          last_update_date?: string
          created_by_user_id: string
          assigned_sales_rep_id: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string
          customer_status?: 'new_client' | 'follow_up' | 'completed'
          first_contact_date?: string
          last_update_date?: string
          created_by_user_id?: string
          assigned_sales_rep_id?: string
        }
      }
      deals: {
        Row: {
          id: string
          customer_id: string
          service: string
          lead_source: string
          sales_representative_id: string
          status: 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'completed' | 'lost'
          deal_details: string
          deal_value: number
          creation_date: string
          last_update_date: string
        }
        Insert: {
          id?: string
          customer_id: string
          service: string
          lead_source: string
          sales_representative_id: string
          status?: 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'completed' | 'lost'
          deal_details: string
          deal_value: number
          creation_date?: string
          last_update_date?: string
        }
        Update: {
          id?: string
          customer_id?: string
          service?: string
          lead_source?: string
          sales_representative_id?: string
          status?: 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'completed' | 'lost'
          deal_details?: string
          deal_value?: number
          creation_date?: string
          last_update_date?: string
        }
      }
      activities: {
        Row: {
          id: string
          customer_id: string | null
          deal_id: string | null
          activity_date: string
          activity_details: string
          activity_type: 'follow_up' | 'call' | 'meeting' | 'email' | 'note'
          recorded_by_user_id: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          deal_id?: string | null
          activity_date?: string
          activity_details: string
          activity_type: 'follow_up' | 'call' | 'meeting' | 'email' | 'note'
          recorded_by_user_id: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          deal_id?: string | null
          activity_date?: string
          activity_details?: string
          activity_type?: 'follow_up' | 'call' | 'meeting' | 'email' | 'note'
          recorded_by_user_id?: string
        }
      }
      tasks: {
        Row: {
          id: string
          customer_id: string | null
          deal_id: string | null
          assigned_to_user_id: string
          task_description: string
          due_date: string
          task_status: 'pending' | 'completed' | 'overdue'
          task_type: 'new_customer_followup' | 'inactivity_alert' | 'scheduled_followup' | 'manager_assigned'
          creation_date: string
          completed_date: string | null
          created_by_user_id: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          deal_id?: string | null
          assigned_to_user_id: string
          task_description: string
          due_date: string
          task_status?: 'pending' | 'completed' | 'overdue'
          task_type: 'new_customer_followup' | 'inactivity_alert' | 'scheduled_followup' | 'manager_assigned'
          creation_date?: string
          completed_date?: string | null
          created_by_user_id: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          deal_id?: string | null
          assigned_to_user_id?: string
          task_description?: string
          due_date?: string
          task_status?: 'pending' | 'completed' | 'overdue'
          task_type?: 'new_customer_followup' | 'inactivity_alert' | 'scheduled_followup' | 'manager_assigned'
          creation_date?: string
          completed_date?: string | null
          created_by_user_id?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          report_date: string
          sales_representative_id: string
          new_customers_count: number
          completed_deals_count: number
          total_revenue_from_completed_deals: number
          daily_notes: string
        }
        Insert: {
          id?: string
          report_date: string
          sales_representative_id: string
          new_customers_count: number
          completed_deals_count: number
          total_revenue_from_completed_deals: number
          daily_notes: string
        }
        Update: {
          id?: string
          report_date?: string
          sales_representative_id?: string
          new_customers_count?: number
          completed_deals_count?: number
          total_revenue_from_completed_deals?: number
          daily_notes?: string
        }
      }
    }
  }
}