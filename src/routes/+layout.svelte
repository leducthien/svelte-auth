<script>
  console.log(`Root layout called at ${Date.now()} for ${window.location.pathname}`);
  import { loginSession } from '$lib/stores';
  import { goto } from "$app/navigation";

  export let data;
  let { user } = data; // data.user is set in layout.server.js
  $loginSession = user; 

  async function logout() {
    let response = await fetch('/auth/logout', {
      method: 'POST'
    });
    if(response.ok) {
      $loginSession = undefined;
      // window.location.pathname = '/login';
      goto('/login');
    } else {
      console.log(`Error logging out: ${response.status} ${response.statusText}`);
    }
  }
  console.log(`- loginSession`, {$loginSession});
</script>

<nav>
  <a href="/">Home</a>
  {#if $loginSession}
    <a href="/protected">Protected</a>
    <a href={'#'} on:click|preventDefault={logout}>Sign out</a>
  {:else}
    <a href="/login">Sign In</a>
  {/if}
</nav>

<slot />