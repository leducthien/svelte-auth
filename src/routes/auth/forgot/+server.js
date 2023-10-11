import { findEmail } from '$lib/stores/db';
import jwt from 'jsonwebtoken';
import Brevo from '@getbrevo/brevo';
import { JWT_SECRET, BREVO_API_KEY } from '$env/static/private';

export async function POST(event) {
  let requestBody = await event.request.json();
  let user = await findEmail(requestBody.email);
  if(user) {
    let token = jwt.sign({subject:user.id}, JWT_SECRET, { expiresIn: '30m'}); // Create a token expiring in 30 minutes
    let defaultClient = Brevo.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = BREVO_API_KEY;
    let apiInstance = new Brevo.TransactionalEmailsApi();
  } else {

  }
}