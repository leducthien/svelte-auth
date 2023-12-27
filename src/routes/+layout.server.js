export async function load(event) { // event: https://kit.svelte.dev/docs/types#public-types-serverloadevent
  console.log(`Layout server load called at ${Date.now()} for path ${event.url.pathname}`);
  let { user } = event.locals; // locals.user set by hooks.server.js, undefined if not logged in
  console.log(`- User `, {user});
  return {
    user
  };
}