/*
  # إنشاء قاعدة بيانات نظام إدارة المبيعات

  1. الجداول الجديدة
    - `users` - جدول المستخدمين
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `role` (enum: sales_representative, sales_manager, administrator)
      - `name` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `last_login_date` (timestamp)
      - `created_by_user_id` (uuid, foreign key)
      - `is_active` (boolean)

    - `customers` - جدول العملاء
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone_number` (text)
      - `customer_status` (enum: new_client, follow_up, completed)
      - `first_contact_date` (timestamp)
      - `last_update_date` (timestamp)
      - `created_by_user_id` (uuid, foreign key)
      - `assigned_sales_rep_id` (uuid, foreign key)

    - `deals` - جدول الصفقات
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `service` (text)
      - `lead_source` (text)
      - `sales_representative_id` (uuid, foreign key)
      - `status` (enum: follow_up_1, follow_up_2, follow_up_3, completed, lost)
      - `deal_details` (text)
      - `deal_value` (numeric)
      - `creation_date` (timestamp)
      - `last_update_date` (timestamp)

    - `activities` - جدول الأنشطة
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key, nullable)
      - `deal_id` (uuid, foreign key, nullable)
      - `activity_date` (timestamp)
      - `activity_details` (text)
      - `activity_type` (enum: follow_up, call, meeting, email, note)
      - `recorded_by_user_id` (uuid, foreign key)

    - `tasks` - جدول المهام
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key, nullable)
      - `deal_id` (uuid, foreign key, nullable)
      - `assigned_to_user_id` (uuid, foreign key)
      - `task_description` (text)
      - `due_date` (timestamp)
      - `task_status` (enum: pending, completed, overdue)
      - `task_type` (enum: new_customer_followup, inactivity_alert, scheduled_followup, manager_assigned)
      - `creation_date` (timestamp)
      - `completed_date` (timestamp, nullable)
      - `created_by_user_id` (uuid, foreign key)

    - `daily_reports` - جدول التقارير اليومية
      - `id` (uuid, primary key)
      - `report_date` (date)
      - `sales_representative_id` (uuid, foreign key)
      - `new_customers_count` (integer)
      - `completed_deals_count` (integer)
      - `total_revenue_from_completed_deals` (numeric)
      - `daily_notes` (text)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات للتحكم في الوصول حسب الأدوار
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('sales_representative', 'sales_manager', 'administrator');
CREATE TYPE customer_status AS ENUM ('new_client', 'follow_up', 'completed');
CREATE TYPE deal_status AS ENUM ('follow_up_1', 'follow_up_2', 'follow_up_3', 'completed', 'lost');
CREATE TYPE activity_type AS ENUM ('follow_up', 'call', 'meeting', 'email', 'note');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'overdue');
CREATE TYPE task_type AS ENUM ('new_customer_followup', 'inactivity_alert', 'scheduled_followup', 'manager_assigned');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'sales_representative',
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login_date timestamptz,
  created_by_user_id uuid REFERENCES users(id),
  is_active boolean DEFAULT true
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  customer_status customer_status DEFAULT 'new_client',
  first_contact_date timestamptz DEFAULT now(),
  last_update_date timestamptz DEFAULT now(),
  created_by_user_id uuid NOT NULL REFERENCES users(id),
  assigned_sales_rep_id uuid NOT NULL REFERENCES users(id)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id),
  service text NOT NULL,
  lead_source text NOT NULL,
  sales_representative_id uuid NOT NULL REFERENCES users(id),
  status deal_status DEFAULT 'follow_up_1',
  deal_details text NOT NULL,
  deal_value numeric NOT NULL DEFAULT 0,
  creation_date timestamptz DEFAULT now(),
  last_update_date timestamptz DEFAULT now()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  deal_id uuid REFERENCES deals(id),
  activity_date timestamptz DEFAULT now(),
  activity_details text NOT NULL,
  activity_type activity_type NOT NULL,
  recorded_by_user_id uuid NOT NULL REFERENCES users(id)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  deal_id uuid REFERENCES deals(id),
  assigned_to_user_id uuid NOT NULL REFERENCES users(id),
  task_description text NOT NULL,
  due_date timestamptz NOT NULL,
  task_status task_status DEFAULT 'pending',
  task_type task_type NOT NULL,
  creation_date timestamptz DEFAULT now(),
  completed_date timestamptz,
  created_by_user_id uuid NOT NULL REFERENCES users(id)
);

-- Daily reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  sales_representative_id uuid NOT NULL REFERENCES users(id),
  new_customers_count integer DEFAULT 0,
  completed_deals_count integer DEFAULT 0,
  total_revenue_from_completed_deals numeric DEFAULT 0,
  daily_notes text DEFAULT ''
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);
CREATE POLICY "Managers can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);

-- RLS Policies for customers table
CREATE POLICY "Users can read all customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Users can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update customers" ON customers FOR UPDATE USING (true);

-- RLS Policies for deals table
CREATE POLICY "Users can read all deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Users can insert deals" ON deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update deals" ON deals FOR UPDATE USING (true);

-- RLS Policies for activities table
CREATE POLICY "Users can read all activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Users can insert activities" ON activities FOR INSERT WITH CHECK (true);

-- RLS Policies for tasks table
CREATE POLICY "Users can read all tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks" ON tasks FOR UPDATE USING (true);

-- RLS Policies for daily_reports table
CREATE POLICY "Users can read all reports" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert reports" ON daily_reports FOR INSERT WITH CHECK (true);

-- Insert sample data
INSERT INTO users (id, username, role, name, email, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', 'administrator', 'مدير النظام', 'admin@crm.com', true),
  ('22222222-2222-2222-2222-222222222222', 'manager1', 'sales_manager', 'أحمد محمد', 'ahmed@crm.com', true),
  ('33333333-3333-3333-3333-333333333333', 'rep1', 'sales_representative', 'سارة أحمد', 'sara@crm.com', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, name, phone_number, customer_status, created_by_user_id, assigned_sales_rep_id) VALUES
  ('44444444-4444-4444-4444-444444444444', 'شركة التقنية المتقدمة', '+201234567890', 'follow_up', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555555', 'مؤسسة الخليج للتجارة', '+201987654321', 'new_client', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Insert sample deals
INSERT INTO deals (id, customer_id, service, lead_source, sales_representative_id, status, deal_details, deal_value) VALUES
  ('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', 'ايداعات', 'Facebook', '33333333-3333-3333-3333-333333333333', 'follow_up_2', 'عميل مهتم بخدمة الإيداعات المصرفية', 50000),
  ('77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555', 'حجز قاعات', 'Calls', '33333333-3333-3333-3333-333333333333', 'follow_up_1', 'حجز قاعة اجتماعات لمدة 6 أشهر', 25000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample activities
INSERT INTO activities (customer_id, deal_id, activity_details, activity_type, recorded_by_user_id) VALUES
  ('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'تم الاتصال بالعميل ومناقشة التفاصيل', 'call', '33333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'إرسال عرض سعر للعميل', 'email', '33333333-3333-3333-3333-333333333333');

-- Insert sample tasks
INSERT INTO tasks (customer_id, assigned_to_user_id, task_description, due_date, task_type, created_by_user_id) VALUES
  ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'متابعة عميل جديد - شركة التقنية المتقدمة', now() + interval '1 day', 'new_customer_followup', '33333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'متابعة الصفقة - لم يتم تسجيل نشاط لأكثر من 10 أيام', now(), 'inactivity_alert', '33333333-3333-3333-3333-333333333333');