import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { pool } from '$lib/stores/db';
import { json } from '@sveltejs/kit';

export async function PUT(event) {
  console.log(`API route called at ${Date.now()} for path ${event.url.pathname}`);
  let requestBody = await event.request.json();
  let token = requestBody.token;
  try {
    let decoded = jwt.verify(token, JWT_SECRET);
    let userId = decoded.subject;
    let password = requestBody.password;
    await pool.query('CALL reset_password($1, $2)', [userId, password]);
    return json({ code: 0, text: 'Password reset is successful.' });
  } catch (error) {
    return json({ code: 1, text: error.message });
  }
}