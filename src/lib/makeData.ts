/**
 * ATHUGA: Það þarf ekki að keyra þetta skjal eða nota það neitt við vefþjónustuna
 * þetta var keyrt einu sinni til þess að mynda json gögnin sem verða notuð.
 */
import { writeFile } from "fs/promises";
import { getFile, readFilesFromDir } from "./file.js";
import { environment, Environment } from "./environment.js";
import { makeCloudinaryConfig, uploadImage } from "./cloudinary.js";
import { logger as loggerSingleton } from './logger.js';

const env : Environment = environment(process.env, loggerSingleton);

makeCloudinaryConfig(env);

async function writeNewData(data: Array<unknown>) {
  const outpath = "./data/eventData.json";
  const dataString = JSON.stringify(data, null, 2);
  try {
    await writeFile(outpath, dataString);
    console.log("Json skrá gerð.");
  } catch (err) {
    console.error("Error við að skrifa json skrá:", err);
  }
}

async function makeData() {
  const fileString = await getFile("./data/events.json");
  let dataJson;
  if (fileString) {
    dataJson = JSON.parse(fileString);
  }
  const newData = [];
  const images = await readFilesFromDir("./imgs");
  console.log(images);
  let imgInx = 0;
  for (const event of dataJson) {
    const image = await uploadImage(images[imgInx]);
    imgInx++;
    const eventData = {
      id: event.id,
      title: event.language.is.title,
      place: event.language.is.place,
      event_image: image,
      date: event.end,
    };
    newData.push(eventData);
  }
  await writeNewData(newData);
}

makeData();
