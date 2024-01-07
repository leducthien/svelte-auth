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
    expires: new Date(Date.now() + 300000).toUTCString() // We set the session expires in 5 minutes or 300.000 milliseconds. Example value is 'Sun, 07 Jan 2024 08:59:54 GMT'. This is used for the expires attribute of the Set-Cookie header. Same format as the expires attribute.
  },
  {
    id: 2,
    userId: 2,
    expires: 'Sat, 06 Jan 2024 09:30:08 GMT'
  }
];

export async function findUserBySessionId(sessionId) {
  let sessionIdInt = Number.parseInt(sessionId); // Input sessionId is a string so we need to parse it
  let session = sessions.find(session => session.id === sessionIdInt && isNotExpired(session.expires));
  if(!session) {
    return null;
  }
  let user = users.find(user => user.id === session.userId);
  console.log(`Db findUserBySessionId called at ${Date.now()}`, {sessionId, user});
  if(user) {
    return { id: user.id, email: user.email };
  }
  return null;
}

/**
 * 
 * @param {String} dateUTCString 
 * @returns True means the date is not expired. False otherwise
 */
function isNotExpired(dateUTCString) {
  let date = new Date(dateUTCString);
  return date.valueOf() > Date.now();
}

export async function login({email, password}) {
  console.log(`DB login function is called at ${Date.now()}`);
  let user = await findUserByEmail({email, password});
  if(user) {
    console.log('- User is found', user);
    let session = sessions.find(session => session.userId = user.id);
    if(session && isNotExpired(session.expires)) {
      console.log('- Session is valid and not expired', session);
      return {
        id: session.id,
        email: user.email,
        expires: session.expires
      };
    }
  }
  console.log('- User is not found');
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