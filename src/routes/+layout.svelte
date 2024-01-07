<script>
  import { loginSession } from '$lib/stores'; // It's recommended to not allow client-side javascript to access cookies. That's why we need a client-side store to save logged in user info such as email and session expire time so all client pages can access
  import { goto, beforeNavigate } from "$app/navigation";
  import { onMount } from "svelte";

  export let data;

  onMount(() => {
    console.log(`Root layout called at ${Date.now()} for ${window.location.pathname}`);
    let { user } = data; // data.user is set in layout.server.js
    $loginSession = user; 
    console.log(`- loginSession`, {$loginSession});
  });

  beforeNavigate(() => {
    let expirationDate = $loginSession?.expires ? new Date($loginSession.expires) : undefined;
    if(expirationDate && expirationDate < new Date()) {
      console.log('Login session has expired');
      $loginSession = null;
    }
  });

  async function logout() {
    let response = await fetch('/auth/logout', {
      method: 'POST'
    });
    if(response.ok) {
      $loginSession = undefined; // clear login session on the client
      goto('/login');
    } else {
      console.log(`Error logging out: ${response.status} ${response.statusText}`);
    }
  }
  
</script>

<nav>
  <a href="/">Home</a>
  {#if $loginSession}
    <a href="/profile">Profile</a>
    <a href={'#'} on:click|preventDefault={logout}>Sign out</a>
  {:else}
    <a href="/login">Sign In</a>
  {/if}
</nav>

<slot />