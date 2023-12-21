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
    if (form.checkValidity()) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement/checkValidity
      try {
        await loginLocal(credentials);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      console.log("Form data is not valid");
      for(const field of form.elements) {
        if(field instanceof HTMLInputElement && !field.checkValidity()) {
          field.focus();
          break;
        }
      }
      let emailField = document.getElementById("email");
      let emailError = document.getElementById("emsg");
      if (emailField.validity.valid) {
        // emailField.classList.remove("emsg");
        emailError.textContent = "";
      } else {
        // emailField.classList.add("emsg");
        emailError.textContent = "Please enter a valid email";
      }
      let passwordField = document.getElementById('password');
      let passwordError = document.getElementById('pmsg');
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

<p>Please enter a valid email and password of the account you have registered with our site when you singed up.</p>

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
    <div id="emsg" class="emsg" />
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
<a href="/">Don't have an account. Sign up free.</a>

<style>
  /* Styles for invalid fields */
  input:invalid {
    border-color: #900;
    background-color: #fdd;
  }

  input:focus:invalid {
    outline: none;
  }

  /* Styles for error message */
  .emsg {
    color: #900;
    width: 100%;
    padding: 0;
    box-sizing: border-box;
    height: 1.5em;
  }
</style>
