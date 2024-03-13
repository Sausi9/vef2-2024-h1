import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_PORT = 3000;

/**
 * @typedef Environment
 * @property {number} port
 * @property {string} sessionSecret
 * @property {string} connectionString
 */

let parsedEnv = null;

/**
 * Validate the environment variables and return them as an object or `null` if
 * validation fails.
 * @param {NodeJS.ProcessEnv} env
 * @returns {Environment | null}
 */
export function environment(env) {
  // If we've already parsed the environment, return the cached value
  // i.e. this is singleton and can be called multiple times in different files
  if (parsedEnv) {
    return parsedEnv;
  }

  const {
    PORT: port,
    SESSION_SECRET: envSessionSecret,
    DATABASE_URL: envConnectionString,
  } = env;

  let error = false;

  if (!envSessionSecret || envSessionSecret.length < 32) {
    console.error(
      'SESSION_SECRET must be defined as string and be at least 32 characters long',
    );
    error = true;
  }

  if (!envConnectionString || envConnectionString.length === 0) {
    console.error('DATABASE_URL must be defined as a string');
    error = true;
  }

  let usedPort;
  const parsedPort = Number.parseInt(port ?? '', 10);
  if (port && Number.isNaN(parsedPort)) {
    console.error('PORT must be defined as a number', port);
    usedPort = parsedPort;
    error = true;
  } else if (parsedPort) {
    usedPort = parsedPort;
  } else {
    console.info('PORT not defined, using default port', DEFAULT_PORT);
    usedPort = DEFAULT_PORT;
  }

  if (error) {
    return null;
  }

  // We know these are defined because we checked above
  /** @type {any} */
  const sessionSecret = envSessionSecret;
  /** @type {any} */
  const connectionString = envConnectionString;

  parsedEnv = {
    port: usedPort,
    sessionSecret,
    connectionString,
  };

  return parsedEnv;
}