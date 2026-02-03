-- 1. Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cif TEXT UNIQUE NOT NULL,
    available_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    plan_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- 2. Create company_employees table
CREATE TABLE IF NOT EXISTS company_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    daily_subsidy_limit DECIMAL(10, 2) NOT NULL DEFAULT 3.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(employee_id) -- An employee can only belong to one company in this simplified version
);
-- 3. Create b2b_transactions table
CREATE TABLE IF NOT EXISTS b2b_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    employee_id UUID REFERENCES user_profiles(id),
    restaurant_id UUID REFERENCES restaurants(id),
    subsidy_amount DECIMAL(10, 2) NOT NULL,
    menu_price DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT now()
);
-- 4. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_transactions ENABLE ROW LEVEL SECURITY;
-- 5. RLS Policies
-- Company Admins can see their own company data
CREATE POLICY "Company admins can view their own company" ON companies FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE id = auth.uid()
                AND role = 'COMPANY_ADMIN'
                AND company_id = companies.id
        )
    );
-- Employees can see their own association
CREATE POLICY "Employees can see their own company link" ON company_employees FOR
SELECT USING (employee_id = auth.uid());
-- Transactions visibility
CREATE POLICY "Company admins see company transactions" ON b2b_transactions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE id = auth.uid()
                AND role = 'COMPANY_ADMIN'
                AND company_id = b2b_transactions.company_id
        )
    );
-- 6. SQL View for Monthly Invoicing
CREATE OR REPLACE VIEW monthly_invoicing_view AS
SELECT company_id,
    TO_CHAR(transaction_date, 'YYYY-MM') as billing_month,
    SUM(subsidy_amount) as total_to_invoice,
    COUNT(id) as total_transactions
FROM b2b_transactions
GROUP BY company_id,
    billing_month;
-- 7. Add company_id to user_profiles if not exists (for role identification)
-- This might require manual execution depending on existing user_profiles schema
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_profiles'
        AND column_name = 'company_id'
) THEN
ALTER TABLE user_profiles
ADD COLUMN company_id UUID REFERENCES companies(id);
END IF;
END $$;