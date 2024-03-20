<script>
  let email, password;
  async function signup() {
    if(!email) { // Tell user email cannot be empty
      return;
    }
    if(!password) {
      return;
    }
    let response = await fetch('/auth/signup');
  }
</script>

<h1>Sign up</h1>

<form novalidate>
  <div>
    <label>
      Email
      <input type="email" placeholder="Email" required bind:value={email} />
    </label>
  <div id="email-error" />
  </div>
  <div>
    <label>
      Password
      <input type="password" required bind:value={password} />
    </label>
    <div id="password-error" />
  </div>
  <button on:click|preventDefault={signup}>Sign up</button>
</form>
<a href='/login'>Already have an account. Log in</a>