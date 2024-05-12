<script>
  import { goto } from '$app/navigation';
  let email = '', notice = '';
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
        let responseBody = await response.json();
        if(responseBody.code == 2000) {
          goto('/email-sent');
        }
        else if(responseBody == 2001) {
          notice = responseBody.text;
        }
        else {
          notice = responseBody.code + ' ' + responseBody.text;
        }
      } else {
        notice = 'Something is wrong ' + response.status; 
      }
    } else { // Form is not valid
      notice = 'Form is not valid';
    }
  }
</script>

{notice}
<form id="forgot">
  <label>
    Email
    <input name="email" type="email" placeholder="Enter your email" required bind:value={email} />
  </label>
  <button on:click|preventDefault={reset}>Reset password</button>
</form>