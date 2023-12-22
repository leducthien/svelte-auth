import { json, error } from "@sveltejs/kit";
import { findUserByEmail } from '$lib/stores/db';

export async function POST(event) { // event: RequestEvent; https://kit.svelte.dev/docs/types#public-types-requestevent
  console.log(`API auth route called at ${new Date()} for path ${event.url.pathname}`);
  let { slug } = event.params;
  let data, headers;
  switch (slug) {
    case 'login':
      let requestBody = await event.request.json();
      let user = await findUserByEmail({email: requestBody.email, password: requestBody.password});
      if (user) {
        data = {
          message: 'Login successful',
          user
        };
        headers = { 'Set-Cookie': `session=${user.id}; Path=/; SameSite=Lax; HttpOnly` } //https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
      } else {
        data = { message: 'Wrong email or password' };
      }
      break;
    case 'logout':
      if(event.locals.user) {
        data = { message: 'Logout successful' };
        headers = { 'Set-Cookie': `session=; Path=/; SameSite=Lax; HttpOnly; Expires=${new Date().toUTCString()}` };
      }
      break;
    default:
      throw error(404, 'Invalid endpoint'); // 404: Not Found
  }
  return json(data, { headers });
}