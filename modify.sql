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
  SELECT count(email) FROM users u WHERE u.email = input_email INTO count;
  IF (count = 0) THEN
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