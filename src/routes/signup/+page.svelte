<script>
  let email, password;
  async function signup() {
    let form = document.getElementById('signup-form');
    let emailField = document.getElementById('email');
    let emailError = document.getElementById('email-error');
    let passwordField = document.getElementById('password');
    let passwordError = document.getElementById('password-error');
    let noticeField = document.getElementById('notice');
    emailError.textContent = '';
    passwordError.textContent = '';
    noticeField.textContent = '';
    if(form.checkValidity()) {
      let response = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
      });
      if(response.ok) {
        
        goto('/login');
      } else {
        noticeField.textContent = response.status + ' ' + response.statusText;
      }
    } else {
      for(let field of form.elements) {
        if(field instanceof HTMLInputElement && !field.checkValidity()) {
          field.focus();
          break;
        }
      }
      if(!emailField.validity.valid) {
        emailError.textContent = 'Please enter a valid email';
      }
      if(!passwordField.validity.valid) {
        passwordError.textContent = 'Please enter a valid password';
      }
    }   
    
  }
</script>

<h1>Sign up</h1>

<div id='notice' class="error" />
<form id='signup-form' novalidate>
  <div>
    <label>
      Email
      <input id="email" type="email" placeholder="Email" required bind:value={email} />
    </label>
  <div id="email-error" class="error" />
  </div>
  <div>
    <label>
      Password
      <input id="password" type="password" required bind:value={password} />
    </label>
    <div id="password-error" class="error" />
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