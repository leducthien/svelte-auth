import { findEmail } from '$lib/stores/db';

export async function POST(event) {
  let requestBody = await event.request.json();
  let user = await findEmail(requestBody.email);
  if(user) {

  } else {

  }
}