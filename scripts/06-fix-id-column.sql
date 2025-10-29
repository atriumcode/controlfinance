-- Fix the id column to auto-generate UUIDs
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Also ensure the id column is the primary key
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_pkey;

ALTER TABLE profiles 
ADD PRIMARY KEY (id);
