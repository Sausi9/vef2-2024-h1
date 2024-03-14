import express, { Request, Response } from 'express';
import { listRegistrations, createRegistration, deleteRegistration } from '../lib/registrations.js';
import { listEvents, getEvent, createEvent, deleteEvent  } from '../lib/events.js';
import { checkAuthenticated, checkNotAuthenticated } from '../app.js';
import { logger } from '../lib/logger.js';

export const adminRouter = express.Router();


export async function indexRoute(req: Request, res: Response) {
  return res.json([
      {
        href: '/events',
        methods: ['GET','POST'],
      },
      {
        href: '/events/:id',
        methods: ['GET','PATCH','DELETE'],
      },
      {
        href: '/registrations',
        methods: ['GET','POST'],
      },
      {
        href: '/registrations/:id',
        methods: ['DELETE'],
      },
      {
        href: '/users',
        methods: ['GET','POST'],
      },
      {
        href: '/users/:id',
        methods: ['DELETE'],
      },
    ]);

}

adminRouter.get('/', indexRoute);
adminRouter.get('/events', listEvents);


adminRouter.get('/events/:id', getEvent);
adminRouter.post('/events', createEvent);
adminRouter.delete('/events/:id', deleteEvent);


adminRouter.get('/registrations', listRegistrations);
adminRouter.post('/registrations', createRegistration);
adminRouter.delete('/registrations/:id', deleteRegistration);
