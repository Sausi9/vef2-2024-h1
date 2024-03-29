import pg from 'pg';
import { DatabaseEvent, Registration, USER } from '../types.js';
import {
  UserMapper,
  UsersMapper,
} from './mappers.js';

import { environment } from './environment.js';
import { ILogger, logger as loggerSingleton } from './logger.js';

const MAX_REGISTRATIONS = 100;

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
   * Get events from the database.
   */
  async getEvents() {
    const q = 'SELECT id, title, place, event_image, date FROM events';
    const result = await this.query(q);

    const events: Array<DatabaseEvent> = [];
    if (result && (result.rows?.length ?? 0) > 0) {
      for (const row of result.rows) {
        const event: DatabaseEvent = {
          id: row.id,
          title: row.title,
          place: row.place,
          date: row.date,
          imageURL: row.event_image
        };
        events.push(event);
      }

      return events;
    }

    return null;
  }

  async getEvent(id: string): Promise<DatabaseEvent | null> {
    
    const q = 'SELECT title, place, event_image, date FROM events WHERE id = $1';
    const result = await this.query(q, [id]);

    if (result && result.rows.length === 1) {
      const row = result.rows[0];
      const event: DatabaseEvent = {
        id: id,
        title: row.title,
        place: row.place,
        date: row.date,
        imageURL: row.event_image
      };
      return event;
    }

    return null;
  }

  async getEventByEventName(title : string) : Promise<DatabaseEvent | null> {
    const q = `SELECT * FROM events WHERE title = $1`;
    const result = await this.query(q,[title]);
    if(result && result.rows.length === 1){
      const row = result.rows[0];
      const event : DatabaseEvent = {
        id: row.id,
        title: title,
        place: row.place,
        date: row.date,
        imageURL: row.event_image
      };
      return event;
    }
    return null;
  }

  async deleteEvent(id: string): Promise<boolean> {
    // eslint-disable-next-line
    const result2 = await this.query('DELETE FROM registrations WHERE event_id = $1', [id]);

    const result = await this.query('DELETE FROM events WHERE id = $1', [
      id,
    ]);

    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to delete event', { result, id });
      return false;
    }
    return true;
  }


  async getRegistration(id: string): Promise<Registration | null> {
    const q = 'SELECT event_title, username, user_id, event_id FROM registrations WHERE id = $1';
    const result = await this.query(q, [id]);

    if (result && result.rows.length === 1) {
      const row = result.rows[0];
      const registration: Registration = {
        id: id,
        eventTitle: row.event_title,
        username: row.username,
        userId: row.userId,
        eventId: row.place,
      };
      return registration;
    }

    return null;
  }


  async getRegistrations(limit = MAX_REGISTRATIONS): Promise<Registration[] | null> {
    const q = `
      SELECT
        registrations.id AS registration_id,
        users.id AS user_id,
        users.name AS user_name,
        events.id AS event_id,
        events.title AS event_title
      FROM
        registrations
      JOIN
        users ON users.id = registrations.user_id
      JOIN
        events ON events.id = registrations.event_id
      ORDER BY
        registrations.id
      LIMIT $1
    `;
  
    const usedLimit = Math.max(Math.min(limit, MAX_REGISTRATIONS), 1);
  
    const result = await this.query(q, [usedLimit]);
  
    if (result && result.rows && result.rows.length > 0) {
      const registrations: Registration[] = result.rows.map(row => ({
        id: row.registration_id,
        userId: row.user_id,
        username: row.user_name,
        eventId: row.event_id,
        eventTitle: row.event_title,
      }));
  
      return registrations;
    }
  
    return null;
  }




  async insertEvent(
  event: Omit<DatabaseEvent, 'id'>
  ): Promise<DatabaseEvent | null> {
    const {title, place, imageURL, date} = event;
    const result = await this.query(
      'INSERT INTO events (title, place, event_image, date) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING RETURNING id, title, place, event_image, date',
      [title, place, imageURL,date],
    );
    if (result) {
      const resultEvent: DatabaseEvent = {
        id: result.rows[0].id,
        title: result.rows[0].title,
        place: result.rows[0].place,
        date: result.rows[0].date,
        imageURL: result.rows[0].event_image
      };
      return resultEvent;
    }
    this.logger.warn('unable to insert event', { result, event });
    return null;
  }

  /**
   * Insert a registration into the database.
   */
  async insertRegistration(
    user : string, event : string
  ): Promise<Registration | null> {

    const userType = await this.getUserByUserName(user);
    const userId = userType.id;
    const eventType = await this.getEventByEventName(event);
    const eventId = eventType.id;
    // Assuming 'id' is auto-generated by the database
    const result = await this.query(
      'INSERT INTO registrations (event_title, username, user_id, event_id) VALUES ($1, $2, $3, $4) RETURNING id, event_title, username, user_id, event_id',
      [event, user, userId, eventId]
    );
  
    if (result && result.rows && result.rows.length > 0) {
      const newRegistration: Registration = {
        id: result.rows[0].id, 
        username: result.rows[0].username,
        eventTitle: result.rows[0].event_title,
        userId: result.rows[0].user_id,
        eventId: result.rows[0].event_id,
      };
      return newRegistration;
    }
    return null;
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const result = await this.query('DELETE FROM registrations WHERE id = $1', [
      id,
    ]);

    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to delete registration', { result, id });
      return false;
    }
    return true;
  }


 async getUserByUserName(
    userName: string,
  ): Promise<USER | null> {
    
    const result = await this.query(`SELECT * FROM users WHERE name = $1`, [
      userName,
    ]);
  
    if (!result) {
      return null;
    }
  
    const user = UserMapper(result.rows[0]);
  
    return user;
  }
  
  async getUserByUserId(
    userId: string,
  ): Promise<USER | null> {
    const result = await this.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
  
    if (!result) {
      return null;
    }
  
    const user = UserMapper(result.rows[0]);
  
    return user;
  }

  async deleteUserByUsername(
    username: string,
  ): Promise<boolean> {
    // eslint-disable-next-line
    const result2 = await this.query('DELETE FROM registrations WHERE username = $1', [username]);

    const result = await this.query('DELETE FROM users WHERE name = $1', [
      username,
    ]);
  
    if (!result) {
      return false;
    }
  
    return result.rowCount === 1;
  }

  async  getUsers(): Promise<Array<USER> | null> {
    const result = await this.query('SELECT * FROM users');
  
    if (!result) {
      return null;
    }
  
    const users = UsersMapper(result.rows).map((d) => {
      return d;
    });
  
    return users;
  }
  
  
  async insertUser(
    user: Omit<USER, 'id'>,
  ): Promise<USER | null> {
    const {name, password  } = user;
    const result = await this.query(
      'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *',
      [ name, password],
    );
  
    const mapped = UserMapper(result?.rows[0]);
  
    return mapped;
  }



  async  conditionalUpdate(
    table: 'events' | 'registrations',
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
    const result = await this.query(q, queryValues);
  
    return result;
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


export async function query(
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


