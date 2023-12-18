<script>
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#autocomplete
  // https://www.w3schools.com/tags/att_form_novalidate.asp
  // https://svelte.dev/docs/element-directives#on-eventname

  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { loginSession } from "$lib/stores";

  let focusField;
  let message;
  let credentials = {
    email: "",
    password: "",
  };

  onMount(() => {
    // https://svelte.dev/docs/svelte#onmount
    focusField.focus();
  });

  async function login() {
    let form = document.getElementById("signIn");
    let emailField, emailError, passwordField, passwordError;
    if (form.checkValidity()) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/checkValidity
      try {
        await loginLocal(credentials);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      // TODO: form is not valid
      console.log("Form data is not valid");
      emailField = document.getElementById("email");
      emailError = document.getElementById("emsg");
      if (emailField.validity.valid) {
        emailField.classList.remove("err");
        emailError.textContent = "";
      } else {
        emailField.classList.add("err");
          emailError.textContent = "Please enter a valid email";
      }
      passwordField = document.getElementById('password');
      passwordError = document.getElementById('pmsg');
      if(passwordField.validity.valid) {
        passwordError.textContent = '';
      } else {
        passwordError.textContent = 'Please enter password';
      }
    }
  }

  async function loginLocal(credentials) {
    let response = await fetch("/auth/login", {
      // https://kit.svelte.dev/docs/web-standards#fetch-apis
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
      let data = await response.json();
      if (data.user) {
        console.log(`${data.message}`);
        $loginSession = data.user;
        goto("/");
      } else {
        console.log(`${data.message}`);
      }
    } else {
      // TODO: throw error
    }
  }
</script>

<h1>Sign In</h1>

<form id="signIn" autocomplete="on" novalidate>
  <div>
    <label>
      Email
      <input
        id="email"
        type="email"
        name="email"
        placeholder="Email"
        required
        autocomplete="email"
        bind:this={focusField}
        bind:value={credentials.email}
      />
    </label>
    <div class="emsg" id="emsg" />
  </div>
  <div>
    <label>
      Password
      <input
        type="password"
        name="password"
        id="password"
        placeholder="Password"
        required        
        bind:value={credentials.password}
      />
    </label>
    <div class="emsg" id="pmsg" />
  </div>
  <button on:click|preventDefault={login}>Sign in</button>
</form>
<a href="/forgot">Forgot your password?</a>

<style>
  .emsg {
    color: #c12020;
    font-weight: bold;
    height: 2em;
  }
</style>
