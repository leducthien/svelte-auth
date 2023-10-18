
export async function load(event) {
  let token = event.params.token;
  return {
    token
  };
}