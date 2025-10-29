-- Add indexes to improve authentication query performance
-- These indexes will make session and profile lookups much faster

-- Index on sessions.token for fast session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- Index on sessions.expires_at for fast expiration checks
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Index on profiles.email for fast email lookups during login
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Index on profiles.company_id for fast company-related queries
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- Index on invoices.company_id for faster invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);

-- Index on payments.invoice_id for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Index on companies.id for faster company lookups
CREATE INDEX IF NOT EXISTS idx_companies_id ON companies(id);

-- Composite index for active sessions by user
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON sessions(user_id, expires_at);
