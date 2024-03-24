-- PGPASSWORD='FrebuMIju2' psql -d auth -h 127.0.0.1 -p 5443 -U postgres -f modify.sql

CREATE OR REPLACE FUNCTION public.register(input json)
  RETURNS json
  LANGUAGE plpgsql
AS $$
DECLARE
  input_email varchar := LOWER(TRIM((input->>'email')::varchar));
  input_password varchar := (input->>'password')::varchar;
  count int := 0;
BEGIN
  SELECT count(email) INTO count FROM users u WHERE u.email = input_email;
  raise notice 'There is % email %', count, input_email;
  IF count > 0 THEN
    RETURN json_build_object(
      'statusCode', 402,
      'status', 'Cannot register. Account already exists.'
    );
  ELSE
    INSERT INTO users(email, password) VALUES (input_email, hash_password(input_password));
    RETURN json_build_object(
      'statusCode', 200,
      'status', 'Register successful'
    );
  END IF;
END;
$$;

ALTER FUNCTION public.register OWNER TO auth;

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
  login_session json;
  auth_count int := 0;
  user_id int;
BEGIN
  IF email_input IS NULL OR password_input IS NULL THEN
    json_build_object(
      'statusCode', 400, 
      'status', 'Please enter email and password');
    RETURN;
  END IF;

  WITH user_authenticated AS (
    SELECT id FROM public.users
    WHERE email = email_input AND password = crypt(password_input, password) LIMIT 1
  ) SELECT count(*) INTO auth_count FROM user_authenticated;

  IF auth_count = 0 THEN
    json_build_object(
      'statusCode', 401,
      'status', 'Wrong email/password'
    );    
  ELSE
    SELECT id INTO user_id FROM user_authenticated;
    SELECT create_session(user_id) INTO login_session;
    json_build_object(
      'statusCode', 200,
      'status', 'Login successful',
      'user', json_build_object(
        'id', user_id, 
        'email', email_input),
      'sessionId', login_session->>'id',
      'expires', login_session->>'expires'
    );
  END IF;
END;
$$;

ALTER FUNCTION public.authenticate OWNER TO auth;

DROP FUNCTION IF EXISTS public.create_session;

CREATE OR REPLACE FUNCTION public.create_session(input_user_id int) 
  RETURNS json
  LANGUAGE plpgsql
  COST 100
  VOLATILE
  PARALLEL UNSAFE
AS $$
DECLARE
  session_id uuid;
BEGIN
  DELETE FROM public.sessions WHERE user_id = input_user_id;
  INSERT INTO public.sessions (user_id) VALUES (input_user_id);
  SELECT json_build_object('id', session_id, 'expires', expires) FROM public.sessions where user_id = input_user_id;
END;
$$;

ALTER FUNCTION public.create_session OWNER TO auth;