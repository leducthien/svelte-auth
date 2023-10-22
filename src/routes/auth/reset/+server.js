import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import { findUserById } from '$lib/stores/db';
import { json } from '@sveltejs/kit';

export async function PUT(event) {
  console.log(`API route called at ${Date.now()} for path ${event.url.pathname}`);
  let requestBody = await event.request.json();
  let token = requestBody.token;
  try {
    let decoded = jwt.verify(token, JWT_SECRET);
    let userId = decoded.subject;
    let user = findUserById(userId);
    if(user) {
      return json({message: 'Password reset successed'}, {
        status: 200,
      });
    } else {
      return json({message: 'User not found. Password reset failed'}, {
        status: 403 // 403: Forbidden
      });
    }
  } catch (error) {
    console.error(error.message);
    return json({ message: error.message }, {
      status: 403
    });
  }
}