import express, { Request, Response } from 'express';
import { listEvents, getEvent } from '../lib/events.js';
import { getRegistration } from '../lib/registrations.js';

export const indexRouter = express.Router();

export async function indexRoute(req: Request, res: Response) {
    return res.json([
        {
          href: '/events',
          methods: ['GET'],
        },
        {
          href: '/events/:id',
          methods: ['GET'],
        },
      ]);

}

indexRouter.get('/', indexRoute);
indexRouter.get('/events', listEvents);
indexRouter.get('/events/:id', getEvent);
indexRouter.get('/registrations/:id',getRegistration);