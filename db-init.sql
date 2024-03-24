-- Invoke this script with 
-- PGPASSWORD='FrebuMIju2' psql -d postgres -h 127.0.0.1 -p 5443 -U postgres -f db-init.sql

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

-- Remove all connections to the auth database except the current connection
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

-- Switch to auth database, all following statements affect this database
\connect auth

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- https://stackoverflow.com/questions/44008252/what-does-collate-pg-catalog-default-do-on-text-attribute-in-postgres-database
-- https://stackoverflow.com/questions/37984264/purpose-of-collate-in-postgres
CREATE TABLE IF NOT EXISTS public.users (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  email varchar(80) NOT NULL COLLATE pg_catalog."default",  
  password varchar(80) NOT NULL COLLATE pg_catalog."default",
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_unique UNIQUE (email)
) TABLESPACE pg_default;

ALTER TABLE public.users OWNER TO auth;

CREATE INDEX users_password ON public.users USING 
  btree (password COLLATE pg_catalog."default" ASC NULLS LAST) TABLESPACE pg_default;

-- or CAST('02:00:00' AS interval)
-- https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-NOTES
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id int NOT NULL,
  expires timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '02:00:00'::interval), 
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID 
) TABLESPACE pg_default;

ALTER TABLE public.sessions OWNER TO auth;

-- If cannot find the session, return empty
CREATE OR REPLACE FUNCTION public.get_session(input_session_id uuid)
  RETURNS json
  RETURNS NULL ON NULL INPUT
  LANGUAGE SQL
BEGIN ATOMIC
  SELECT json_build_object(
    'userId', u.id,
    'email', u.email,
    'expires', s.expires
  ) AS user_session FROM public.sessions s INNER JOIN public.users u ON s.user_id = u.id
  WHERE s.id = input_session_id AND s.expires > CURRENT_TIMESTAMP LIMIT 1;
END;

ALTER FUNCTION public.get_session OWNER TO auth;

CREATE OR REPLACE FUNCTION public.hash_password(input_password varchar)
  RETURNS varchar
  LANGUAGE SQL
BEGIN ATOMIC
  SELECT crypt(input_password, gen_salt('bf', 8));
END;

ALTER FUNCTION public.hash_password OWNER TO auth;



CREATE OR REPLACE PROCEDURE public.delete_session(input_user_id int)
  LANGUAGE SQL
BEGIN ATOMIC
  DELETE FROM sessions s WHERE s.user_id = input_user_id;
END;

ALTER PROCEDURE public.delete_session OWNER TO auth;

CREATE OR REPLACE PROCEDURE public.reset_password(input_user_id int, input_password varchar)
  LANGUAGE SQL
BEGIN ATOMIC
  UPDATE users SET password = hash_password(input_password) WHERE users.id = input_user_id;
END;

ALTER PROCEDURE public.reset_password OWNER TO auth;

CREATE OR REPLACE PROCEDURE public.upsert_user(input_user json)
  LANGUAGE plpgsql
AS $$
DECLARE
  input_user_id int := coalesce((input_user->>'id')::int,0);
  input_email varchar := (input_user->>'email')::varchar;
  input_password varchar := coalesce((input_user->>'password'),'');
BEGIN
  IF input_user_id = 0 THEN
    INSERT INTO users(email, password) VALUES (input_email, hash_password(input_password));
  ELSE
    UPDATE users SET
      email = input_email,
      password = CASE WHEN input_password = '' THEN password ELSE hash_password(input_password) END
    WHERE id = input_user_id;
  END IF;
END;
$$;

ALTER PROCEDURE public.upsert_user OWNER TO auth;

CALL upsert_user(json_build_object(
  'email','timducle@yahoo.com',
  'password', '123'));
--CALL upsert_user("{'email':'a@b.vn', 'password': '345'}"::json);