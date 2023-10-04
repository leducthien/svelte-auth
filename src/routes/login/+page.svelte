<script>
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#autocomplete
  // https://www.w3schools.com/tags/att_form_novalidate.asp
  // https://svelte.dev/docs/element-directives#on-eventname

  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { loginSession} from '$lib/stores';

  let focusField;
  let message;
  let credentials = {
    email: '',
    password: ''
  }

  onMount(() => { // https://svelte.dev/docs/svelte#onmount
    focusField.focus();
  });

  async function login() {
    let form = document.getElementById('signIn');
    if(form.checkValidity()) { // https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/checkValidity
      try {
        await loginLocal(credentials);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      // TODO: form is not valid
      console.log('Form data is not valid');
    }
  }

  async function loginLocal(credentials) {
    let response = await fetch('/auth/login', { // https://kit.svelte.dev/docs/web-standards#fetch-apis
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    if(response.ok) { // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
      let data = await response.json();
      if(data.user) {
        console.log(`${data.message}`);
        $loginSession = data.user;
        // window.location.pathname = '/'; // goto() only navigate client-side, will not active server hook
        goto('/');
      }
      else {
        console.log(`${data.message}`);
      }
    } else {
      // TODO: throw error
    }
    
  }
</script>


<h1>Sign In</h1>

<form id="signIn" autocomplete="on" novalidate>
  <label>
    Email
    <input type="email" name="email" placeholder="Email" required autocomplete="email" bind:this={focusField} bind:value={credentials.email} />
  </label>
  <label>
    Password
    <input type="password" name="password" placeholder="Password" required minlength="3" maxlength="80" autocomplete="current-password" bind:value={credentials.password} />
  </label>
  <button on:click|preventDefault={login}>Sign in</button>
</form>