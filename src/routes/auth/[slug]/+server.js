import { json, error } from '@sveltejs/kit';
import { login, signup } from '$lib/stores/db';

export async function POST(event) { // event: RequestEvent; https://kit.svelte.dev/docs/types#public-types-requestevent
  console.log(`API auth route called at ${Date.now()} for path ${event.url.pathname}`);
  let { slug } = event.params;
  let { cookies } = event;
  let data, headers, requestBody;
  switch (slug) {
    case 'login':
      requestBody = await event.request.json();
      let loginSession = await login({email: requestBody.email, password: requestBody.password});
      if (loginSession) {
        data = {
          message: 'Login successful',
          userLoginSession: {
            sessionId: loginSession.id,
            email: loginSession.email,
            expires: loginSession.expires
          }
        };
        // headers = { 'Set-Cookie': `session=${user.id}; Path=/; SameSite=Lax; HttpOnly` }; // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
        cookies.set('session', loginSession.id, { path: '/', expires: new Date(loginSession.expires) }); // https://kit.svelte.dev/docs/types#public-types-cookies
        console.log('- Login result', data);
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
    case 'signup':
      requestBody = await event.request.json();
      let signupResult = await signup({email: requestBody.email, password: requestBody.password});
      if(signupResult) {
        data = {
          statusCode: signupResult.statusCode,
          status: signupResult.status
        };
      }
    default:
      throw error(404, 'Invalid endpoint'); // 404: Not Found
  }
  // return json(data, { headers });
  return json(data);
}