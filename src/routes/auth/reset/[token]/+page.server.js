import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export async function load(event) {
  let token = event.params.token;
  try {
    jwt.verify(token, JWT_SECRET);
    return {
      code: 0,
      token
    }
  } catch (error) {
    console.log(error);
    return {
      code: 1
    };
  }
}