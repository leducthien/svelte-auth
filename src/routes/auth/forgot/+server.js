import { findEmail } from '$lib/stores/db';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

export async function POST(event) {
  let requestBody = await event.request.json();
  let user = await findEmail(requestBody.email);
  if(user) {

  } else {

  }
}