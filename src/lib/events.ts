import { Request, Response } from 'express';
import { getDatabase } from '../lib/db.js';
import {
  atLeastOneBodyValueValidator,
  genericSanitizerMany,
  stringValidator,
  validationCheck,
  xssSanitizerMany,
} from './validation.js';

export async function listEvents(req: Request, res: Response) {
  const events = await getDatabase()?.getEvents();

  if (!events) {
    return res.status(500).json({ error: 'could not get events' });
  }

  return res.json(events);
}

export async function getEvent(req: Request, res: Response) {
  const event = await getDatabase()?.getEvent(req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'event not found' });
  }

  return res.json(event);
}

export async function createEventHandler(req: Request, res: Response) {
  const { title, place, description, imageURL } = req.body;

  const createdEvent = await getDatabase()?.insertEvent({
    title: title,
    place: place,
    description: description,
    imageURL: imageURL,
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
  const deletedGame = await getDatabase()?.deleteEvent(req.params.id);

  if (!deletedGame) {
    return res.status(500).json({ error: 'could not delete game' });
  }

  return res.status(204).json({});
}