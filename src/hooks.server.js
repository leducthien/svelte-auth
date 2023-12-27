import { findUserBySessionId } from '$lib/stores/db';

export async function handle({event, resolve}) { // https://kit.svelte.dev/docs/types#public-types-handle
  console.log(`Server hook handle called at ${Date.now()} for path ${event.url.pathname}`);
  let { cookies } = event;
  let sessionId = cookies.get('session');
  console.log(`- Session id: ${sessionId}`);
  if(sessionId) {
    let user = await findUserBySessionId(sessionId);    
    if(user) {
      event.locals.user = user;
    } else { // There's a session id but no corresponding user. It could be a malicious request.
      cookies.delete('session', { path: '/' });
    }
  }
  let response = await resolve(event);
  return response;
}