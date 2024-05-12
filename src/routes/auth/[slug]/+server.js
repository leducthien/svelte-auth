import { json, error } from '@sveltejs/kit';
import { login, signup, deleteUserSession } from '$lib/stores/db';
import jwt from 'jsonwebtoken';
import Brevo from '@getbrevo/brevo';
import { JWT_SECRET, BREVO_API_KEY, DOMAIN } from '$env/static/private';
import { pool } from '$lib/stores/db';

export async function POST(event) { // event: RequestEvent; https://kit.svelte.dev/docs/types#public-types-requestevent
  console.log(`API auth route called at ${Date.now()} for path ${event.url.pathname}`);
  let { slug } = event.params;
  let { cookies } = event;
  let data, headers, requestBody;
  switch (slug) {
    case 'login':
      requestBody = await event.request.json();
      let loginSession = await login({ email: requestBody.email, password: requestBody.password });
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
      if (event.locals.user) {
        let deleteUserSessionResult = await deleteUserSession(cookies.get('session'));
        if (deleteUserSessionResult.statusCode == 200) {
          // headers = { 'Set-Cookie': `session=; Path=/; SameSite=Lax; HttpOnly; Expires=${new Date().toUTCString()}` }; // This will tell the browser to delete the cookie 'session'
          cookies.delete('session', { path: '/' });
          data = { message: 'Logout successful' };
        } else {
          data = {
            statusCode: deleteUserSessionResult.statusCode,
            status: deleteUserSessionResult.status
          };
        }
      }
      break;
    case 'signup':
      try {
        requestBody = await event.request.json();
        if (requestBody.email && requestBody.password) {
          let findEmail = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [requestBody.email.trim().toLowerCase()]);
          if(findEmail.rowCount > 0) {
            return json({code: 1, text: 'Email already exists'});
          }
          let token = await jwt.sign({ email: requestBody.email, password: requestBody.password }, JWT_SECRET, { expiresIn: '30m' });
          let client = Brevo.ApiClient.instance;
          client.authentications['api-key'].apiKey = BREVO_API_KEY;
          let apiInstance = new Brevo.TransactionalEmailsApi();
          let data = await apiInstance.sendTransacEmail( // Send using htmlContent
            {
              'subject': 'Account signup',
              'sender': { 'email': 'noreply@cani.me', 'name': 'Cani' },
              'to': [{ 'email': requestBody.email }],
              'htmlContent': `<a href="${DOMAIN}/signup/${token}">Verify email</a> {{params.bodyMessage}}`,
              'params': { 'bodyMessage': 'Your browser will open to verify your email' }
            }
          );
          console.log('- Verification email sent', data);
          return json({ code: 0, text: 'Verification email sent' });
        }
        else {
          return json({code: 1, text: 'Invalid email or password'});
        }
      } catch (error) {
        console.log(error);
        return json({ code: 1, text: error.message });
      }
    default:
      throw error(404, 'Invalid endpoint'); // 404: Not Found
  }
  // return json(data, { headers });
  return json(data);
}