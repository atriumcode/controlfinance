-- Update the registration trigger to associate users with existing companies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_uuid UUID;
  existing_company_id UUID;
  user_cnpj TEXT;
BEGIN
  -- Get CNPJ from user metadata
  user_cnpj := COALESCE(NEW.raw_user_meta_data ->> 'cnpj', '');
  
  -- Check if company with this CNPJ already exists
  SELECT id INTO existing_company_id 
  FROM public.companies 
  WHERE cnpj = user_cnpj AND cnpj != '';
  
  IF existing_company_id IS NOT NULL THEN
    -- Use existing company
    company_uuid := existing_company_id;
  ELSE
    -- Create new company
    INSERT INTO public.companies (name, cnpj)
    VALUES (
      COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Minha Empresa'),
      user_cnpj
    )
    RETURNING id INTO company_uuid;
  END IF;

  -- Create profile linked to the company (existing or new)
  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (
    NEW.id,
    company_uuid,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    CASE 
      WHEN existing_company_id IS NOT NULL THEN 'user'  -- New users in existing companies get 'user' role
      ELSE 'admin'  -- First user in new company gets 'admin' role
    END
  );

  RETURN NEW;
END;
$$;

-- The trigger is already created, so we don't need to recreate it
-- It will automatically use the updated function
