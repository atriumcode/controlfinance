-- Update existing "administrador" roles to "admin" in the database
UPDATE profiles 
SET role = 'admin' 
WHERE role = 'administrador';

-- Verify the update
SELECT id, email, full_name, role 
FROM profiles 
WHERE role = 'admin';
