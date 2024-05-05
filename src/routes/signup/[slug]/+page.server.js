import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { pool } from '$lib/stores/db';

export async function load(event) {
    let token = event.params.slug;
    try {
        let decoded = jwt.verify(token, JWT_SECRET);
        let queryResult = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [decoded.email]);
        if(queryResult.rowCount > 0) {
          return {code: 1, text: 'Email already exists'};
        }
        await pool.query('CALL upsert_user($1)', [{email: decoded.email, password: decoded.password}]);
        return {code: 0, token};
    } catch (error) {
        console.log(error);
        return {code: 1, text: error.message};
    }
}