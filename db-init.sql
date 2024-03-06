-- Invoke this script with 
-- PGPASSWORD='FrebuMIju2' psql -d postgres -f db-init.sql -h 127.0.0.1 -p 5443 -U postgres

-- Create role for authentication
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT rolname
    FROM pg_catalog.pg_roles
    WHERE rolname='auth'
  ) THEN CREATE ROLE auth;
  END IF;
END
$do$;



