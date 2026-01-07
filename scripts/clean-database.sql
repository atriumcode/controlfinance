-- Script to clean all data from the database tables
-- This will delete all records from all tables in the correct order to avoid foreign key constraints

-- Delete in reverse dependency order to avoid foreign key violations
DELETE FROM audit_logs;
DELETE FROM payments;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM clients;
DELETE FROM profiles;
DELETE FROM companies;

-- Reset any sequences if needed (PostgreSQL auto-generates UUIDs so no sequences to reset)

-- Verify all tables are empty
SELECT 'audit_logs' as table_name, COUNT(*) as record_count FROM audit_logs
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'companies', COUNT(*) FROM companies;
