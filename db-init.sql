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

-- https://stackoverflow.com/questions/44008252/what-does-collate-pg-catalog-default-do-on-text-attribute-in-postgres-database
-- https://stackoverflow.com/questions/37984264/purpose-of-collate-in-postgres
CREATE TABLE IF NOT EXISTS public.users (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY,
  email varchar(80) NOT NULL COLLATE pg_catalog."default",  
  password varchar(20) NOT NULL COLLATE pg_catalog."default",
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_unique UNIQUE (email)
) TABLESPACE pg_default;

ALTER TABLE public.users OWNER TO auth;

CREATE INDEX users_password ON public.users USING 
  btree (password COLLATE pg_catalog."default" ASC NULLS LAST) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id int NOT NULL,
  expires timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '02:00:00'::interval), -- or CAST('02:00:00' AS interval)
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_fkey FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID -- https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-NOTES
) TABLESPACE pg_default;

ALTER TABLE public.sessions OWNER TO auth;

CREATE OR REPLACE FUNCTION public.authenticate (input json, OUT response json) 
  RETURNS json 
  LANGUAGE plpgsql
  COST 100
  VOLATILE
  PARALLEL UNSAFE
AS $BODY$
DECLARE
  email_input varchar(80) := LOWER(TRIM(input->>'email')::varchar);
  password_input varchar(80) := (input->>'password')::varchar;
BEGIN
  IF email_input IS NULL OR password_input IS NULL THEN
    response := json_build_object('statusCode', 400, 'status', 'Please enter email and password', 'user', NULL);
    RETURN;
  END IF;

  WITH user_authenticated AS (
    SELECT id FROM public.users
    WHERE email = email_input AND password = crypt(password_input, password) LIMIT 1
  ) SELECT json_build_object(
    'statusCode', CASE WHEN (SELECT COUNT(*) FROM user_authenticated) > 0 THEN 200 ELSE 401 END,
    'status', CASE WHEN (SELECT COUNT(*) FROM user_authenticated) > 0 THEN 'Success' ELSE 'Wrong email/password' END,
    'user', CASE WHEN (SELECT COUNT(*) FROM user_authenticated) > 0 THEN (SELECT json_build_object('id', id, 'email', email_input) FROM user_authenticated) ELSE NULL END,
    'sessionId', (SELECT create_session(id) FROM user_authenticated)
  ) INTO response;
END;
$BODY$;

ALTER FUNCTION public.authenticate OWNER TO auth;

CREATE OR REPLACE FUNCTION public.create_session(input_user_id int) 
  RETURNS uuid
  LANGUAGE plpgsql
  COST 100
  VOLATILE
  PARALLEL UNSAFE
AS $BODY$
BEGIN
  DELETE FROM public.sessions WHERE user_id = input_user_id;
  INSERT INTO public.sessions (user_id) VALUES (input_user_id) RETURNING id;
END;
$BODY$;

ALTER FUNCTION public.create_session OWNER TO auth;