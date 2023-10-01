let users = [
  {
    id: 1,
    email: 'timducle@yahoo.com',
    password: '123'
  },
  {
    id: 2,
    email: 'thientaidientoan@yahoo.com',
    password: '345'
  }
];

export async function findUserBySessionId(sessionId) {
  let sessionIdInt = Number.parseInt(sessionId);
  let user = users.find(user => user.id === sessionIdInt);
  console.log(`Db findUserBySessionId called at ${Date.now()}`, {sessionId, user});
  if(user) {
    return { id: user.id, email: user.email };
  }
  return null;
}

export async function findUserByEmail({email, password}) {
  let user = users.find(user => user.email === email && user.password === password);
  if(user) {
    return {id: user.id, email:user.email};
  }
  return null;
}