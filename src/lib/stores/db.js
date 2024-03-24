import { Pool } from 'pg';

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

const pool = new Pool({
  host: '127.0.0.1',
  port: 5443,
  database: 'auth',
  user: 'postgres',
  password:'FrebuMIju2'
});

export async function deleteUserSession(sessionId) {
  try {
    await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);  
  } catch (error) {
    return {
      statusCode: 500,
      status: error.msg
    };
  } finally {
    return {
      statusCode: 200,
      status: 'Delete session successfully'
    };
  }
}

export async function signup({email, password}) {
  console.log(`Db signup function is called, input email: ${email}`);
  let result = await pool.query('SELECT register($1)', [JSON.stringify({email, password})]);
  console.log(`Signup result `, JSON.stringify(result.rows));
  if(result.rowCount == 0) {
    return {
      statusCode: 500,
      status: 'Some error occured during signup'
    };
  }
  let r0 = result.rows[0].register;
  return {
    statusCode: r0.statusCode,
    status: r0.status
  }
}

export async function findUserBySessionId(sessionId) {
  console.log(`Db findUserBySessionId called at ${Date.now()}`, {sessionId});
  let result = await pool.query('SELECT get_session($1) AS session', [sessionId]);
  if(result.rowCount == 0) {
    console.log('- Session is not found');
    return null;
  }
  console.log('- Session is found');
  let session = result.rows[0].session;
  return { id: session.userId, email: session.email, expires: session.expires };
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
  console.log(`DB login function is called at ${Date.now()}`, {email, password});
  let user = await findUserByEmail({email, password});
  if(user) {
    console.log('- User is found', user);
    let session = await findUserBySessionId(user.sessionId);
    if(session && isNotExpired(session.expires)) {
      console.log('- Session is valid and not expired', session);
      return {
        id: user.sessionId,
        email: user.email,
        expires: session.expires
      };
    }
  }
  console.log('- User is not found');
  return null;
}

export async function findUserByEmail({email, password}) {
  let result = await pool.query('SELECT authenticate($1)', [JSON.stringify({email,password})]);
  if(result.rowCount == 0) {
    return null;
  }
  let auth = result.rows[0].authenticate; // A row has this format {"authenticate":{"statusCode":200,"status":"Success","user":{"id":1,"email":"timducle@yahoo.com"},"sessionId":"29b604a6-85db-4e7c-a358-ab342406a1e7"}}
  console.log(`- User: ${JSON.stringify(auth)}`);
  if(auth.statusCode != 200) {
    console.log(`- Status code: ${auth.statusCode}, message: ${auth.status}`);
    return null;
  }
  return {id: auth.user.id, email:auth.user.email, sessionId: auth.sessionId};
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