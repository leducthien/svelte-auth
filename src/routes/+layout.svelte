<script>
  import { loginSession } from '$lib/stores';
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  export let data;

  onMount(() => {
    console.log(`Root layout called at ${Date.now()} for ${window.location.pathname}`);
    let { user } = data; // data.user is set in layout.server.js
    $loginSession = user; 
    console.log(`- loginSession`, {$loginSession});
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