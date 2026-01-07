-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_uuid UUID;
BEGIN
  -- Create company first
  INSERT INTO public.companies (name, cnpj)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Minha Empresa'),
    COALESCE(NEW.raw_user_meta_data ->> 'cnpj', '')
  )
  RETURNING id INTO company_uuid;

  -- Create profile linked to the company
  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (
    NEW.id,
    company_uuid,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    'admin'
  );

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
