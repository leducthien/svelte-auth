-- PGPASSWORD='FrebuMIju2' psql -d auth -h 127.0.0.1 -p 5443 -U postgres -f test.sql

SELECT authenticate('{"email":"timducle@yahoo.com", "password":"123"}');

SELECT register('{"email":"timducle@yahoo.com", "password":"123"}');