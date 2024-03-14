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

-- Switch to auth database, all following statements affect this database
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

CREATE OR REPLACE FUNCTION public.authenticate (input json, OUT response json) 
  RETURNS json 
  LANGUAGE plpgsql
  COST 100
  VOLATILE
  PARALLEL UNSAFE
AS $$
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
$$;

ALTER FUNCTION public.authenticate OWNER TO auth;

CREATE OR REPLACE FUNCTION public.create_session(input_user_id int) 
  RETURNS uuid
  RETURNS NULL ON NULL INPUT
  LANGUAGE SQL
  COST 100
  VOLATILE
  PARALLEL UNSAFE
BEGIN ATOMIC
  DELETE FROM public.sessions WHERE user_id = input_user_id;
  INSERT INTO public.sessions (user_id) VALUES (input_user_id) RETURNING id;
END;

ALTER FUNCTION public.create_session OWNER TO auth;

-- If cannot find the session, return empty
CREATE OR REPLACE FUNCTION public.get_session(input_session_id uuid)
  RETURNS json
  RETURNS NULL ON NULL INPUT
  LANGUAGE SQL
BEGIN ATOMIC
  SELECT json_build_object(
    'sessionId', input_session_id,
    'userId', u.id,
    'email', u.email,
    'expires', s.expires
  ) AS user_session FROM public.sessions s INNER JOIN public.users u ON s.user_id = u.id
  WHERE s.id = input_session_id AND s.expires > CURRENT_TIMESTAMP LIMIT 1;
END;

ALTER FUNCTION public.get_session OWNER TO auth;

CREATE OR REPLACE FUNCTION public.register(input json)
  RETURNS json
  LANGUAGE plpgsql
AS $$
DECLARE
  input_email varchar(80) := LOWER(TRIM(input->>'email')::varchar);
  input_password varchar(80) := (input->>'password')::varchar;
  user_found json := authenticate(input);
BEGIN
  IF (user_found->>'statusCode')::int = 400 THEN 
    RETURN user_found;
  END IF;

  IF (user_found->>'statusCode')::int = 200 THEN
    RETURN json_build_object(
      'statusCode', 402,
      'status', 'Cannot register. Account already exists.'
    );
  END IF;

  INSERT INTO users(email, password) VALUES (input_email, crypt(input_password, gen_salt('bf', 8)));
  RETURN json_build_object(
    'statusCode', 200,
    'status', 'Register successful'
  );
END;
$$;

ALTER FUNCTION public.register OWNER TO auth;