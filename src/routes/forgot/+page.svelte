<script>
  let form;
  let email;
  async function reset() {
    if(form.checkValidity()) {
      let response = await fetch('/auth/forgot', {
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
      });
      if(response.ok) {

      } else {
        
      }
    } else { // Form is not valid

    }
  }
</script>


<form bind:this={form}>
  <label>
    Email
    <input name="email" type="email" placeholder="Enter your email" required bind:value={email}/>
  </label>
  <button on:click|preventDefault={reset}>Reset password</button>
</form>