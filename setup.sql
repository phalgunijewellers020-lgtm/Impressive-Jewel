-- ============================================================
-- JEWELLERY FACTORY DASHBOARD — DATABASE SETUP
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- Profiles (auto-created from auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Company settings
create table if not exists company_settings (
  id uuid default uuid_generate_v4() primary key,
  company_name text default 'Jewellery Factory',
  address text,
  city text,
  state text,
  pin_code text,
  contact_number text,
  alternate_contact text,
  email text,
  website text,
  gst_number text,
  business_reg_number text,
  additional_info text,
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Employees
create table if not exists employees (
  id uuid default uuid_generate_v4() primary key,
  employee_code text unique not null,
  name text not null,
  contact_number text,
  joining_date date,
  status text default 'active' check (status in ('active', 'inactive')),
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Items
create table if not exists items (
  id uuid default uuid_generate_v4() primary key,
  item_code text unique not null,
  name text not null,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Filing Rate Master (item-based)
create table if not exists filing_rates (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references items(id),
  wastage_rate numeric(10,4) default 0.012,
  amount_rate numeric(10,4) default 2.5,
  effective_from date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Filing Out
create table if not exists filing_out (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  weight numeric(12,4) not null,
  pieces integer,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_filing_out_date on filing_out(date);
create index if not exists idx_filing_out_employee on filing_out(employee_id);

-- Filing Return
create table if not exists filing_return (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  weight numeric(12,4) not null,
  pieces integer,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_filing_return_date on filing_return(date);
create index if not exists idx_filing_return_employee on filing_return(employee_id);

-- Wax Job Rate Master
create table if not exists wax_job_rates (
  id uuid default uuid_generate_v4() primary key,
  category text not null unique,
  rate numeric(10,4) not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stone Size Master
create table if not exists stone_sizes (
  id uuid default uuid_generate_v4() primary key,
  size_code text unique not null,
  description text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Wax Out
create table if not exists wax_out (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  wax_weight numeric(12,4) not null,
  wax_pieces integer default 0,
  stone_weight numeric(12,4) default 0,
  stone_count integer default 0,
  stone_size_id uuid references stone_sizes(id),
  setting_category text,
  job_rate_id uuid references wax_job_rates(id),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_wax_out_date on wax_out(date);
create index if not exists idx_wax_out_employee on wax_out(employee_id);

-- Wax Return
create table if not exists wax_return (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  wax_weight numeric(12,4) not null,
  wax_pieces integer default 0,
  stone_weight numeric(12,4) default 0,
  stone_count integer default 0,
  setting_stone_count integer default 0,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_wax_return_date on wax_return(date);
create index if not exists idx_wax_return_employee on wax_return(employee_id);

-- Polish Rate Master (item-based)
create table if not exists polish_rates (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references items(id),
  loss_rate numeric(10,4) default 0,
  amount_rate numeric(10,4) default 0,
  effective_from date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Polish Out
create table if not exists polish_out (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  weight numeric(12,4) not null,
  pieces integer,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_polish_out_date on polish_out(date);

-- Polish Return
create table if not exists polish_return (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  weight numeric(12,4) not null,
  pieces integer,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_polish_return_date on polish_return(date);

-- Machine Polish Out
create table if not exists machine_polish_out (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  weight numeric(12,4) not null,
  pieces integer,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Machine Polish Return
create table if not exists machine_polish_return (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  employee_id uuid references employees(id) not null,
  item_id uuid references items(id) not null,
  weight numeric(12,4) not null,
  pieces integer,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit Logs
create table if not exists audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now()
);

-- ── Seed Default Data ────────────────────────────────────────

insert into company_settings (company_name, address)
  values ('My Jewellery Factory', '')
  on conflict do nothing;

insert into wax_job_rates (category, rate, description)
  values
    ('Setting & Tatal', 0.10, 'Setting and Tatal combined'),
    ('Only Setting', 0.05, 'Setting only'),
    ('Only Tatal', 0.05, 'Tatal only')
  on conflict (category) do nothing;

-- ── Enable Row Level Security ────────────────────────────────

alter table profiles enable row level security;
alter table company_settings enable row level security;
alter table employees enable row level security;
alter table items enable row level security;
alter table filing_rates enable row level security;
alter table filing_out enable row level security;
alter table filing_return enable row level security;
alter table wax_job_rates enable row level security;
alter table stone_sizes enable row level security;
alter table wax_out enable row level security;
alter table wax_return enable row level security;
alter table polish_rates enable row level security;
alter table polish_out enable row level security;
alter table polish_return enable row level security;
alter table machine_polish_out enable row level security;
alter table machine_polish_return enable row level security;
alter table audit_logs enable row level security;

-- ── RLS Policies (authenticated access) ─────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','company_settings','employees','items',
    'filing_rates','filing_out','filing_return',
    'wax_job_rates','stone_sizes','wax_out','wax_return',
    'polish_rates','polish_out','polish_return',
    'machine_polish_out','machine_polish_return','audit_logs'
  ] loop
    execute format(
      'create policy if not exists "auth_access_%s" on %s for all using (auth.role() = ''authenticated'')',
      t, t
    );
  end loop;
end$$;

-- ── Auto-create Profile on Signup ────────────────────────────

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Done ─────────────────────────────────────────────────────
-- Next steps:
-- 1. Go to Supabase Auth > Users > Invite User to create your admin account
-- 2. After first login, update your profile role to 'admin':
--    UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
-- 3. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
