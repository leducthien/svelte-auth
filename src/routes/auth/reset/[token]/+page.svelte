<script>
  import { goto } from '$app/navigation';
  export let data;
  let form, password, confirmPassword;

  async function reset() {
    if(form.checkValidity()) {
      let response = await fetch('/auth/reset', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: data.token, password, confirmPassword})
      })
      if(response.ok) {
        goto('/auth/reset/success');
      } else {
        console.log('fetch failed', response.status, response.statusText);
      }
    } else {
      console.log('Form is not valid');
    }
  }
</script>

<h1>Reset password</h1>
<form bind:this={form}>
  <label>
    New password
    <input type="password" required bind:value={password} />
  </label>
  <label>
    Retype password
    <input type="password" required bind:value={confirmPassword} />
  </label>
  <button on:click|preventDefault={reset}>Submit</button>
</form>