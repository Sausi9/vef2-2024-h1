import { readFile } from "fs/promises";
import { poolEnd, query } from "./lib/db.js";
import { environment } from './lib/environment.js';

const SCHEMA_FILE = "./sql/schema.sql";
const DROP_SCHEMA_FILE = "./sql/drop.sql";
const INSERT_FILE = './sql/insert.sql';

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString("utf-8"));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString("utf-8"));
}

async function create() {
  const env = environment(process.env);
  if(!env){
    process.exit(1);
  }
  const drop = await dropSchema();

  if (drop) {
    console.info("schema dropped");
  } else {
    console.info("schema not dropped, exiting");
    process.exit(-1);
  }

  const result = await createSchema();

  if (result) {
    console.info("schema created");
  } else {
    console.info("schema not created");
  }

  const data = await readFile(INSERT_FILE);
  const insert = await query(data.toString("utf-8"));

  if (insert) {
    console.info("data inserted");
  } else {
    console.info("data not inserted");
  }

  await poolEnd();
}

create().catch((err) => {
  console.error("Error creating running setup", err);
});
