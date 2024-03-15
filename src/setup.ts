import { readFile } from "fs/promises";
import { getDatabase, Database } from "./lib/db.js";
import { getFile } from './lib/file.js';
import { DatabaseEvent } from './types.js';

const SCHEMA_FILE = "./sql/schema.sql";
const DROP_SCHEMA_FILE = "./sql/drop.sql";
const INSERT_FILE = './sql/insert.sql';

export async function createSchema(db : Database, schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return db.query(data.toString("utf-8"));
}

export async function dropSchema(db: Database, dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return db.query(data.toString("utf-8"));
}

async function create() { 
    const db = getDatabase();

    const drop = await dropSchema(db);

    if (drop) {
        console.info("schema dropped");
    } else {
        console.info("schema not dropped, exiting");
        process.exit(-1);
    }

    const result = await createSchema(db);

    if (result) {
        console.info("schema created");
    } else {
        console.info("schema not created");
    }

    const data = await readFile(INSERT_FILE);
    const insert = await db.query(data.toString("utf-8"));

    if (insert) {
        console.info("data inserted");
    } else {
        console.info("data not inserted");
    }
    const dataString = await getFile('./data/eventData.json');
    if(dataString){
        const dataJson = JSON.parse(dataString);
        for(const data of dataJson){
            const eventToBeInserted : Omit<DatabaseEvent,'id'> = {
                title: data.title,
                place: data.place,
                date: data.date,
                imageURL: data.event_image
            };
            const insertedEvent = await db.insertEvent(eventToBeInserted);
        }
    }
    const users = ['Audunn','Dagur','Egill','osk7','someGuy'];
    for(let i = 0; i < 5; i++){
        const event = await db.getEvent((i+1).toString());
        const regInserted = await db.insertRegistration(users[i],event.title);
    }
    await db.close();
}

create().catch((err) => {
  console.error("Error creating running setup", err);
});
