import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import xss from 'xss';
import { getDatabase } from '../lib/db.js';
import { logger } from '../lib/logger.js';
import { Database} from '../lib/db.js';

const db = getDatabase();

dotenv.config();

/**
 * Hjálparföll fyrir notendur, uppfletting, búa til, uppfæra.
 */

const { BCRYPT_ROUNDS: bcryptRounds = '1' } = process.env;

export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(bcryptRounds, 10)
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

function isInt(i) {
  return i !== '' && Number.isInteger(Number(i));
}

// TODO move to utils
function isString(s) {
  return typeof s === 'string';
}
