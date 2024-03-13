import pg from 'pg';
import slugify from 'slugify';
import {Event, DatabaseEvent, Registration,USER } from '../types.js';
import {
  TeamMapper,
  TeamsMapper,
  GameMapper,
  GamesMapper,
  UserMapper,
} from './mappers.js';

import { environment } from './environment.js';
import { ILogger, logger as loggerSingleton } from './logger.js';

const MAX_GAMES = 100;

/**
 * Database class.
 */
export class Database {
  private connectionString: string ;
  private logger: ILogger;
  private pool: pg.Pool | null = null;

  /**
   * Create a new database connection.
   */
  constructor(connectionString: string, logger: ILogger) {
    this.connectionString = connectionString;
    this.logger = logger;
  }

  open() {
    this.pool = new pg.Pool({ connectionString: this.connectionString });

    this.pool.on('error', (err) => {
      this.logger.error('error in database pool', err);
      this.close();
    });
  }

  /**
   * Close the database connection.
   */
  async close(): Promise<boolean> {
    if (!this.pool) {
      this.logger.error('unable to close database connection that is not open');
      return false;
    }

    try {
      await this.pool.end();
      return true;
    } catch (e) {
      this.logger.error('error closing database pool', { error: e });
      return false;
    } finally {
      this.pool = null;
    }
  }

  /**
   * Connect to the database via the pool.
   */
  async connect(): Promise<pg.PoolClient | null> {
    if (!this.pool) {
      this.logger.error('Reynt að nota gagnagrunn sem er ekki opinn');
      return null;
    }

    try {
      const client = await this.pool.connect();
      return client;
    } catch (e) {
      this.logger.error('error connecting to db', { error: e });
      return null;
    }
  }

  /**
   * Run a query on the database.
   * @param query SQL query.
   * @param values Parameters for the query.
   * @returns Result of the query.
   */
  async query(
    query: string,
    values: Array<string | number> = [],
  ): Promise<pg.QueryResult | null> {
    const client = await this.connect();

    if (!client) {
      return null;
    }

    try {
      const result = await client.query(query, values);
      return result;
    } catch (e) {
      this.logger.error('Error running query', e);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Get teams from the database.
   */
  async getEvents() {
    const q = 'SELECT id, title, place, description, image FROM events';
    const result = await this.query(q);

    const events: Array<DatabaseEvent> = [];
    if (result && (result.rows?.length ?? 0) > 0) {
      for (const row of result.rows) {
        const team: DatabaseTeam = {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
        };
        teams.push(team);
      }

      return teams;
    }

    return null;
  }

  async getTeam(slug: string): Promise<DatabaseTeam | null> {
    const q = 'SELECT id, name, description FROM teams WHERE slug = $1';
    const result = await this.query(q, [slug]);

    if (result && result.rows.length === 1) {
      const row = result.rows[0];
      const team: DatabaseTeam = {
        id: row.id,
        name: row.name,
        slug: slug,
        description: row.description,
      };
      return team;
    }

    return null;
  }

  async deleteTeam(slug: string): Promise<boolean> {
    const result = await this.query('DELETE FROM teams WHERE slug = $1', [
      slug,
    ]);

    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to delete team', { result, slug });
      return false;
    }
    return true;
  }

  async conditionalUpdate(
    table: 'teams' | 'games',
    id: string | number,
    fields: Array<string | null>,
    values: Array<string | number | null>,
  ) {
    const filteredFields = fields.filter((i) => typeof i === 'string');
    const filteredValues = values.filter(
      (i): i is string | number =>
        typeof i === 'string' || typeof i === 'number',
    );

    if (filteredFields.length === 0) {
      return false;
    }

    if (filteredFields.length !== filteredValues.length) {
      throw new Error('fields and values must be of equal length');
    }

    // id is field = 1
    const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

    const q = `
      UPDATE ${table}
        SET ${updates.join(', ')}
      WHERE
        id = $1
      RETURNING *
      `;

    const queryValues: Array<string | number> = (
      [id] as Array<string | number>
    ).concat(filteredValues);
    const result = await this.query(q, queryValues);

    return result;
  }

  /**
   * Get games from the database.
   * @param {number} [limit=MAX_GAMES] Number of games to get.
   */
  async getGames(limit = MAX_GAMES): Promise<Game[] | null> {
    const q = `
      SELECT
        games.id as id,
        date,
        home_team.name AS home_name,
        home_score,
        away_team.name AS away_name,
        away_score
      FROM
        games
      LEFT JOIN
        teams AS home_team ON home_team.id = games.home
      LEFT JOIN
        teams AS away_team ON away_team.id = games.away
      ORDER BY
        date DESC
      LIMIT $1
    `;

    // Ensure we don't get too many games and that we get at least one
    const usedLimit = Math.min(limit > 0 ? limit : MAX_GAMES, MAX_GAMES);

    const result = await this.query(q, [usedLimit.toString()]);

    const games: Array<Game> = [];
    if (result && (result.rows?.length ?? 0) > 0) {
      for (const row of result.rows) {
        const game: Game = {
          id: row.id,
          date: row.date,
          home: {
            name: row.home_name,
            score: row.home_score,
          },
          away: {
            name: row.away_name,
            score: row.away_score,
          },
        };
        games.push(game);
      }

      return games;
    }

    return null;
  }

  /**
   * Get a game from the database.
   */
  async getGame(id: string): Promise<Game | null> {
    const q = `
      SELECT
        games.id as id,
        date,
        home_team.name AS home_name,
        home_score,
        away_team.name AS away_name,
        away_score
      FROM
        games
      LEFT JOIN
        teams AS home_team ON home_team.id = games.home
      LEFT JOIN
        teams AS away_team ON away_team.id = games.away
      WHERE
        games.id = $1
    `;

    const result = await this.query(q, [id]);

    if (result && result.rows.length === 1) {
      const row = result.rows[0];
      const game: Game = {
        id: row.id,
        date: row.date,
        home: {
          name: row.home_name,
          score: row.home_score,
        },
        away: {
          name: row.away_name,
          score: row.away_score,
        },
      };
      return game;
    }

    return null;
  }

  /**
   * Insert a team into the database.
   * @param team Team to insert.
   */
  async insertTeam(
    team: string,
    description?: string,
  ): Promise<DatabaseTeam | null> {
    const result = await this.query(
      'INSERT INTO teams (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id, name, description',
      [team, slugify(team), description ?? ''],
    );
    if (result) {
      const resultTeam: DatabaseTeam = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        slug: result.rows[0].slug,
        description: result.rows[0].description,
      };
      return resultTeam;
    }
    return null;
  }

  /**
   * Insert teams into the database.
   * @param teams List of teams to insert.
   * @returns List of teams inserted.
   */
  async insertTeams(teams: string[]): Promise<Array<DatabaseTeam>> {
    const inserted: Array<DatabaseTeam> = [];
    for await (const team of teams) {
      const result = await this.insertTeam(team);
      if (result) {
        inserted.push(result);
      } else {
        this.logger.warn('unable to insert team', { team });
      }
    }
    return inserted;
  }

  /**
   * Insert a game into the database.
   */
  async insertGame(game: Omit<DatabaseGame, 'id'>): Promise<Game | null> {
    const q = `
      INSERT INTO
        games (date, home, away, home_score, away_score)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await this.query(q, [
      game.date,
      game.home_id,
      game.away_id,
      game.home_score.toString(),
      game.away_score.toString(),
    ]);

    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to insert game', { result, game });
      return null;
    }
    return this.getGame(result.rows[0].id);
  }

  /**
   * Insert gamedays into the database.
   */
  async insertGamedays(
    gamedays: Gameday[],
    dbTeams: DatabaseTeam[],
  ): Promise<boolean> {
    if (gamedays.length === 0) {
      this.logger.warn('no gamedays to insert');
      return false;
    }

    if (dbTeams.length === 0) {
      this.logger.warn('no teams to insert');
      return false;
    }

    for await (const gameday of gamedays) {
      for await (const game of gameday.games) {
        const homeId = dbTeams.find((t) => t.name === game.home.name)?.id;
        const awayId = dbTeams.find((t) => t.name === game.away.name)?.id;

        if (!homeId || !awayId) {
          this.logger.warn('unable to find team id', { homeId, awayId });
          continue;
        }

        const result = await this.insertGame({
          date: gameday.date.toISOString(),
          home_id: homeId,
          away_id: awayId,
          home_score: game.home.score,
          away_score: game.away.score,
        });

        if (!result) {
          this.logger.warn('unable to insert gameday', { result, gameday });
        }
      }
    }

    return true;
  }

  /**
   * Delete a game from the database.
   */
  async deleteGame(id: string): Promise<boolean> {
    const result = await this.query('DELETE FROM games WHERE id = $1', [id]);

    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to delete game', { result, id });
      return false;
    }
    return true;
  }
}

let db: Database | null = null;

/**
 * Return a singleton database instance.
 */
export function getDatabase() {
  if (db) {
    return db;
  }

  const env = environment(process.env, loggerSingleton);

  if (!env) {
    return null;
  }
  db = new Database(env.connectionString, loggerSingleton);
  db.open();

  return db;
}






let savedPool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (savedPool) {
    return savedPool;
  }

  const { DATABASE_URL: connectionString } = process.env;
  if (!connectionString) {
    console.error('vantar DATABASE_URL í .env');
    throw new Error('missing DATABASE_URL');
  }

  savedPool = new pg.Pool({ connectionString });

  savedPool.on('error', (err) => {
    console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
    throw new Error('error in db connection');
  });

  return savedPool;
}

export async function query(
  q: string,
  values: Array<unknown> = [],
  silent = false,
) {
  const pool = getPool();

  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    if (!silent) console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (!silent) console.error('unable to query', e);
    if (!silent) console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function conditionalUpdate(
  table: 'teams' | 'games',
  id: string | number,
  fields: Array<string | null>,
  values: Array<string | number | null>,
) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i): i is string | number => typeof i === 'string' || typeof i === 'number',
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues: Array<string | number> = (
    [id] as Array<string | number>
  ).concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}

export async function poolEnd() {
  const pool = getPool();
  await pool.end();
}

export async function getTeams(): Promise<Array<Team> | null> {
  const result = await query('SELECT * FROM teams');

  if (!result) {
    return null;
  }

  const teams = TeamsMapper(result.rows).map((d) => {
    return d;
  });

  return teams;
}

export async function getTeamBySlug(
  slug: string,
): Promise<Team | null> {
  const result = await query('SELECT * FROM teams WHERE slug = $1', [
    slug,
  ]);

  if (!result) {
    return null;
  }

  const team = TeamMapper(result.rows[0]);

  return team;
}

export async function deleteTeamBySlug(slug: string): Promise<boolean> {
  const result = await query('DELETE FROM teams WHERE slug = $1', [slug]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}

export async function insertTeam(team: Omit<Team, 'id'>,silent = false,): Promise<Team| null> {
  const name  = team.name;
  const slug  = team.slug;
  const description = team.description;
  const result = await query(
    'INSERT INTO teams (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created, updated',
    [name, slug, description],
    silent,
  );

  const mapped = TeamMapper(result?.rows[0]);

  return mapped;
}


export async function insertGame(
  game: Omit<Game, 'id'>,
  silent = false,
): Promise<Game | null> {
  const {date,  home, away, home_score, away_score, created, updated } = game;
  const result = await query(
    'INSERT INTO games (date , home, away, home_score, away_score, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [date, home, away, home_score, away_score, created, updated],
    silent,
  );

  const mapped = GameMapper(result?.rows[0]);

  return mapped;
}




export async function getGameByGameId(
  gameId: string,
): Promise<Game | null> {
  const result = await query(`SELECT * FROM games WHERE id = $1`, [
    gameId,
  ]);

  if (!result) {
    return null;
  }

  const game = GameMapper(result.rows[0]);

  return game;
}

export async function deleteGameByGameId(
  gameId: string,
): Promise<boolean> {
  const result = await query('DELETE FROM games WHERE id = $1', [
    gameId,
  ]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}


export async function getGames(): Promise<Array<Game> | null> {
  const result = await query('SELECT * FROM games');

  if (!result) {
    return null;
  }

  const games = GamesMapper(result.rows).map((d) => {
    return d;
  });

  return games;
}

export async function getUserByUserName(
  userName: string,
): Promise<USER | null> {
  const result = await query(`SELECT * FROM users WHERE name = $1`, [
    userName,
  ]);

  if (!result) {
    return null;
  }

  const user = UserMapper(result.rows[0]);

  return user;
}

export async function getUserByUserId(
  userId: string,
): Promise<USER | null> {
  const result = await query(`SELECT * FROM users WHERE id = $1`, [
    userId,
  ]);

  if (!result) {
    return null;
  }

  const user = UserMapper(result.rows[0]);

  return user;
}


export async function insertUser(
  user: Omit<USER, 'id'>,
  silent = false,
): Promise<USER | null> {
  const {name, password  } = user;
  const result = await query(
    'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *',
    [ name, password],
    silent,
  );

  const mapped = UserMapper(result?.rows[0]);

  return mapped;
}


