import { json, error } from '@sveltejs/kit';
import { findUserByEmail } from '$lib/stores/db';

export async function POST(event) { // event: RequestEvent; https://kit.svelte.dev/docs/types#public-types-requestevent
  console.log(`API auth route called at ${Date.now()} for path ${event.url.pathname}`);
  let { slug } = event.params;
  let { cookies } = event;
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
        // headers = { 'Set-Cookie': `session=${user.id}; Path=/; SameSite=Lax; HttpOnly` }; // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
        cookies.set('session', user.id, { path: '/' }); // https://kit.svelte.dev/docs/types#public-types-cookies
      } else {
        data = { message: 'Wrong email or password' };
      }
      break;
    case 'logout':
      if(event.locals.user) {
        data = { message: 'Logout successful' };
        // headers = { 'Set-Cookie': `session=; Path=/; SameSite=Lax; HttpOnly; Expires=${new Date().toUTCString()}` }; // This will tell the browser to delete the cookie 'session'
        cookies.delete('session', { path: '/' });
      }
      break;
    default:
      throw error(404, 'Invalid endpoint'); // 404: Not Found
  }
  // return json(data, { headers });
  return json(data);
}