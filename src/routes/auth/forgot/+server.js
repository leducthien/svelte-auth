import { findEmail } from '$lib/stores/db';
import jwt from 'jsonwebtoken';
import Brevo from '@getbrevo/brevo';
import { JWT_SECRET, BREVO_API_KEY, DOMAIN } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST(event) {
  console.log(`API route called at ${Date.now()} for path ${event.url.pathname}`);
  console.log(`- Domain env variable: ${DOMAIN}`);
  let requestBody = await event.request.json();
  try {
    let user = await findEmail(requestBody.email);
    if (user) {
      let token = jwt.sign({ subject: user.id }, JWT_SECRET, { expiresIn: '30m' }); // Create a token expiring in 30 minutes
      let client = Brevo.ApiClient.instance;
      client.authentications['api-key'].apiKey = BREVO_API_KEY;
      let apiInstance = new Brevo.TransactionalEmailsApi();
      let data = await apiInstance.sendTransacEmail( // Send using htmlContent
        {
          'subject': 'Password reset',
          'sender': { 'email': 'noreply@cani.me', 'name': 'Cani' },
          'to': [{ 'name': 'Thien', 'email': requestBody.email }],
          'htmlContent': `<a href="${DOMAIN}/auth/reset/${token}">Reset password</a> {{params.bodyMessage}}`,
          'params': { 'bodyMessage': 'Your browser will open and ask for new password' }
        }
      );
      console.log('- Email sent', data);
      return json({code: 2000, text: 'Email sent'});
    } else {
      console.log(`- User not found for email ${requestBody.email}`);
      return json({code: 2001, text: 'Email not found'});
    }
  } catch (error) {
    console.error(error);
    return json({code: 5000, text: 'Error occured'}); 
  }
  
}