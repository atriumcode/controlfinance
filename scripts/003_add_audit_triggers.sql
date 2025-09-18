-- Add audit triggers to automatically log changes to important tables

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log for authenticated users
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (
      action,
      resource_type,
      resource_id,
      user_id,
      company_id,
      severity,
      details,
      created_at
    ) VALUES (
      TG_OP::text,
      TG_TABLE_NAME::text,
      COALESCE(NEW.id::text, OLD.id::text),
      auth.uid(),
      COALESCE(NEW.company_id, OLD.company_id),
      CASE 
        WHEN TG_OP = 'DELETE' THEN 'warning'
        ELSE 'info'
      END,
      CASE 
        WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
        WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        ELSE row_to_json(NEW)
      END,
      NOW()
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for important tables
CREATE TRIGGER audit_companies_trigger
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_invoices_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_invoice_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_import_logs_trigger
  AFTER INSERT OR UPDATE OR DELETE ON import_logs
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();
