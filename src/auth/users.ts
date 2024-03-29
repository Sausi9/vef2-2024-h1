import bcrypt from 'bcrypt';
import xss from 'xss';
import { getDatabase } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { environment } from '../lib/environment.js';
import { logger as loggerSingleton } from '../lib/logger.js';

const db = getDatabase();

const env = environment(process.env, loggerSingleton);

/**
 * Hjálparföll fyrir notendur, uppfletting, búa til, uppfæra.
 */

const { bcryptRounds: bcryptRounds = 1 } = env;

export async function createUser(username : string, password : string) {
  const hashedPassword = await bcrypt.hash(
    password,
    bcryptRounds
  );

  const q = `
    INSERT INTO
      users (name, password)
    VALUES
      ($1, $2)
    RETURNING *`;

  const values = [xss(username), hashedPassword];
  const result = await db.query(q, values);

  return result.rows[0];
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE name = $1';

  try {
    const result = await db.query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    logger.error('unable to query user by username');
    return null;
  }

  return false;
}


export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await db.query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}