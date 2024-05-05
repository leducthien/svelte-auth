<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email='', password='', noticeField ='', form, emailField, emailError = '', passwordField, passwordError = '';

  onMount(() => {
    emailField.focus();
  });

  async function signup() {
    if(form.checkValidity()) {
      emailError = '';
      passwordError = '';
      let response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
      });
      if(response.ok) {
        let responseBody = await response.json();        
        if(responseBody.code == 0) {
          goto('/signup/sent');
          // noticeField = 'Verification email sent. Please check your email.';
        }
        else {
          noticeField = responseBody.text;
        }
      } else {
        noticeField = responseBody.text;
      }
    } else {
      noticeField = '';
      emailError = '';
      passwordError = '';
      for(let field of form.elements) {
        if(field instanceof HTMLInputElement && !field.checkValidity()) {
          field.focus();
          break;
        }
      }
      if(!emailField.validity.valid) {
        emailError = 'Please enter a valid email';
      }
      if(!passwordField.validity.valid) {
        passwordError = 'Please enter a valid password';
      }
    }   
  }
</script>

<h1>Sign up</h1>

<p>Please enter valid email and password.</p>
<div class="error">{noticeField}</div>
<form bind:this={form} novalidate>
  <div>
    <label>
      Email
      <input type="email" placeholder="Email" autocomplete="email" required bind:value={email} bind:this={emailField} />
    </label>
  <div class="error">{emailError}</div>
  </div>
  <div>
    <label>
      Password
      <input id="password" type="password" required bind:value={password} bind:this={passwordField} />
    </label>
    <div class="error">{passwordError}</div>
  </div>
  <button on:click|preventDefault={signup}>Sign up</button>
</form>
<a href='/login'>Already have an account. Log in</a>

<style>
  .error {
    color: #900;
    width: 100%;
    padding: 0;
    box-sizing: border-box;
    height: 1.5em;
  }
</style>