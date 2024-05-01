<script>
  import { goto } from "$app/navigation";
  export let data;
  let form,
    password,
    confirmPassword,
    notice = "";

  async function reset() {
    if (form.checkValidity()) {
      if (password !== confirmPassword) {
        notice = "Password does not match.";
      } else {
        let response = await fetch("/auth/reset", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: data.token,
            password
          }),
        });
        if (response.ok) {
          let responseBody = await response.json();
          if (responseBody.code == 0) {
            goto("/auth/reset/success");
          } else {
            notice = responseBody.text;
          }
        } else {
          notice = response.status + ' ' + response.statusText;
        }
      }
    } else {
      notice = "Form is not valid";
    }
  }
</script>

{#if data.code == 0}
<h1>Reset password</h1>

<div class="notice">{notice}</div>
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
{:else}
<p>Link is not valid</p>
{/if}

<style>
  .notice {
    height: 1.5em;
    color: red;
  }
</style>
