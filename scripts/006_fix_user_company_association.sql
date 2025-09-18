-- Update the registration trigger to use company_id from metadata instead of creating new company
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_uuid UUID;
  metadata_company_id TEXT;
BEGIN
  -- Get company_id from user metadata
  metadata_company_id := NEW.raw_user_meta_data ->> 'company_id';
  
  IF metadata_company_id IS NOT NULL AND metadata_company_id != '' THEN
    -- Use existing company from metadata
    company_uuid := metadata_company_id::UUID;
  ELSE
    -- Fallback: Create new company (for first user registration)
    INSERT INTO public.companies (name, cnpj)
    VALUES (
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Minha Empresa'),
      COALESCE(NEW.raw_user_meta_data ->> 'cnpj', '')
    )
    RETURNING id INTO company_uuid;
  END IF;

  -- Create profile linked to the company
  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (
    NEW.id,
    company_uuid,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'leitura')
  );

  RETURN NEW;
END;
$$;

-- The trigger already exists, so it will automatically use the updated function
