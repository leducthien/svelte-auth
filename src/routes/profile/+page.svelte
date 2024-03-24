<script>
  import { loginSession } from '$lib/stores';
</script>

{#if $loginSession}
<h1>Profile page</h1>

<p>Welcome {$loginSession.email}</p>
{:else}
<p>Please sign in to see this page</p>
{/if}