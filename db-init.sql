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


-- pg_backend_pid: https://www.postgresql.org/docs/current/functions-info.html#FUNCTIONS-INFO-SESSION-TABLE
SELECT pid, pg_terminate_backend(pid) 
FROM pg_stat_activity
WHERE datname = 'auth' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS auth;

CREATE DATABASE auth
  WITH
  OWNER = auth
  ENCODING = 'UTF8'
  TABLESPACE = pg_default
  CONNECTION LIMIT = -1;

\connect auth

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";