<script>
  import { goto } from '$app/navigation';
  let email = '';
  async function reset() {
    let form = document.getElementById('forgot');
    if(form.checkValidity()) {
      let response = await fetch('/auth/forgot', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email})
      });
      if(response.ok) {
        goto('/forgot/sent');
      } else {
        console.log('Something is wrong', response.status);
      }
    } else { // Form is not valid

    }
  }
</script>


<form id="forgot">
  <label>
    Email
    <input name="email" type="email" placeholder="Enter your email" required bind:value={email} />
  </label>
  <button on:click|preventDefault={reset}>Reset password</button>
</form>