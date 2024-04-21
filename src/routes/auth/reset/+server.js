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
    return json({ code: 0, text: 'Password reset succeeded' });
  } catch (error) {
    return json({ code: 1, text: error.message });
  }

  // jwt.verify(token, JWT_SECRET, (err, decoded) => {
  //   if (err) {
  //     if (err.name === 'TokenExpiredError') {
  //       return json({ code: 1, text: 'Reset password link is expired' });
  //     } else {
  //       let s = err.name + ' ' + err.message;
  //       console.log(s);
  //       return json({ code: 1, text: s });
  //     }
  //   }
  //   
  //   try {
  //     
  //   } catch (error) {
  //     'User not found. Password reset failed' });
  //   }

  // });
}