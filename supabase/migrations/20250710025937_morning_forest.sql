-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  deal_id uuid,
  activity_date timestamp with time zone DEFAULT now(),
  activity_details text NOT NULL,
  activity_type USER-DEFINED NOT NULL,
  recorded_by_user_id uuid NOT NULL,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_recorded_by_user_id_fkey FOREIGN KEY (recorded_by_user_id) REFERENCES public.users(id),
  CONSTRAINT activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id),
  CONSTRAINT activities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  customer_status USER-DEFINED DEFAULT 'new_client'::customer_status,
  first_contact_date timestamp with time zone DEFAULT now(),
  last_update_date timestamp with time zone DEFAULT now(),
  created_by_user_id uuid NOT NULL,
  assigned_sales_rep_id uuid NOT NULL,
  CONSTRAINT customers_pkey PRIMARY KEY (id),
  CONSTRAINT customers_assigned_sales_rep_id_fkey FOREIGN KEY (assigned_sales_rep_id) REFERENCES public.users(id),
  CONSTRAINT customers_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.daily_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_date date NOT NULL,
  sales_representative_id uuid NOT NULL,
  new_customers_count integer DEFAULT 0,
  completed_deals_count integer DEFAULT 0,
  total_revenue_from_completed_deals numeric DEFAULT 0,
  daily_notes text DEFAULT ''::text,
  CONSTRAINT daily_reports_pkey PRIMARY KEY (id),
  CONSTRAINT daily_reports_sales_representative_id_fkey FOREIGN KEY (sales_representative_id) REFERENCES public.users(id)
);
CREATE TABLE public.deals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  service text NOT NULL,
  lead_source text NOT NULL,
  sales_representative_id uuid NOT NULL,
  status USER-DEFINED DEFAULT 'follow_up_1'::deal_status,
  deal_details text NOT NULL,
  deal_value numeric NOT NULL DEFAULT 0,
  creation_date timestamp with time zone DEFAULT now(),
  last_update_date timestamp with time zone DEFAULT now(),
  CONSTRAINT deals_pkey PRIMARY KEY (id),
  CONSTRAINT deals_sales_representative_id_fkey FOREIGN KEY (sales_representative_id) REFERENCES public.users(id),
  CONSTRAINT deals_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid,
  deal_id uuid,
  assigned_to_user_id uuid NOT NULL,
  task_description text NOT NULL,
  due_date timestamp with time zone NOT NULL,
  task_status USER-DEFINED DEFAULT 'pending'::task_status,
  task_type USER-DEFINED NOT NULL,
  creation_date timestamp with time zone DEFAULT now(),
  completed_date timestamp with time zone,
  created_by_user_id uuid NOT NULL,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT tasks_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id),
  CONSTRAINT tasks_assigned_to_user_id_fkey FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id),
  CONSTRAINT tasks_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES public.deals(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'sales_representative'::user_role,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_login_date timestamp with time zone,
  created_by_user_id uuid,
  is_active boolean DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id)
);