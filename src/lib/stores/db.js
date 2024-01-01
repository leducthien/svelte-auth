let users = [ // Simulate the users table in db 
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

let sessions = [ // Simulate the sessions table in db
  {
    id: 1,
    userId: 1,
    maxAge: 3600 // The session expires in 3600s or 1h. This is used for the Max-Age attribute of the Set-Cookie header
  },
  {
    id: 2,
    userId: 2,
    maxAge: 1800 // The session expires in 1800s or 30m
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

export async function findEmail(email) {
  let user = users.find(user => user.email === email);
  if(user) {
    return { id: user.id };
  }
  return null;
}

export async function findUserById(id) {
  let userId = Number.parseInt(id);
  let user = users.find(user => user.id === userId);
  if(user) {
    return { id: user.id, email: user.email };
  }
  return null;
}