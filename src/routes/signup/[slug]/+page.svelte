<script>
    export let data;
</script>

{#if data.code == 0}
    <p>Sign up is successful.</p>
{:else}
    <p>Link is not valid.</p>
{/if}