import { Request, Response , NextFunction} from 'express';
import { getDatabase } from '../lib/db.js';
import {
  atLeastOneBodyValueValidator,
  genericSanitizerMany,
  stringValidator,
  validationCheck,
  xssSanitizerMany,
  xssSanitizer,
} from './validation.js';
import { EventMapper } from './mappers.js';
import { Environment, environment } from './environment.js';
import { logger as loggerSingleton } from './logger.js';
import { makeCloudinaryConfig, uploadImage, deleteImage } from './cloudinary.js';


const env : Environment = environment(process.env, loggerSingleton);

makeCloudinaryConfig(env);

const db = getDatabase();

export async function listEvents(req: Request, res: Response) {
  const events = await db.getEvents();

  if (!events) {
    return res.status(500).json({ error: 'could not get events' });
  }

  return res.json(events);
}

export async function getEvent(req: Request, res: Response) {

  const event = await db.getEvent(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'event not found' });
  }

  return res.json(event);
}

export async function createEventHandler(req: Request, res: Response) {
  const { title, place, date, imageURL } = req.body;
  const image = await uploadImage(imageURL);
  const createdEvent = await db.insertEvent({
    title: title,
    place: place,
    date: date,
    imageURL: image,
  });

  if (!createdEvent) {
    return res.status(500).json({ error: 'could not create event' });
  }

  return res.status(201).json(createdEvent);
}

export const createEvent = [
  atLeastOneBodyValueValidator(['title', 'place', 'description', 'imageURL']),
  genericSanitizerMany,
  xssSanitizerMany,
  createEventHandler,
];

export async function deleteEvent(req: Request, res: Response) {
  const eventToBeDeleted = await db.getEvent(req.params.id);
  await deleteImage(eventToBeDeleted.imageURL);
  const deletedGame = await db.deleteEvent(req.params.id);

  if (!deletedGame) {
    return res.status(500).json({ error: 'could not delete game' });
  }

  return res.status(204).json({});
}



export const updateEvent = [
  stringValidator({ field: 'title', maxLength: 300, optional: true }),
  stringValidator({
    field: 'place',
    valueRequired: false,
    maxLength: 200,
    optional: true,
  }),
  atLeastOneBodyValueValidator(['title', 'place']),
  xssSanitizer('title'),
  xssSanitizer('place'),
  validationCheck,
  updateEventHandler,
];

export async function updateEventHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { id } = req.params;
  const event = await db.getEvent(id);

  if (!event) {
    return next();
  }
  

  const {title, place} = req.body;

  const fields = [
    typeof title === 'string' && title ? 'title' : null,
    typeof place === 'string' && place ? 'place' : null,
  ];

  const values = [
    typeof title === 'string' && title ? title : null,
    typeof place === 'string' && place ? place : null,
  ];

  const updated = await db.conditionalUpdate(
    'events',
    event.id,
    fields,
    values,
  );

  if (!updated) {
    return next(new Error('unable to update event'));
  }

  const updatedEvent = EventMapper(updated.rows[0]);
  return res.json(updatedEvent);
}