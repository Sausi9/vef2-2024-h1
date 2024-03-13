import express, { Request, Response } from 'express';
export const indexRouter = express.Router();
import { listRegistrations, createRegistration, deleteRegistration } from '../lib/registrations.js';
import { listEvents, getEvent, createEvent, deleteEvent  } from '../lib/events.js';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { getUserByUserName } from '../lib/db.js';
import {users} from '../app.js';





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

indexRouter.get('/', indexRoute);
indexRouter.get('/events', listEvents);


indexRouter.get('/events/:id', getEvent);
indexRouter.post('/events', createEvent);
indexRouter.delete('/events/:id', deleteEvent);


indexRouter.get('/registrations', listRegistrations);
indexRouter.post('/registrations', createRegistration);
indexRouter.delete('/registrations/:id', deleteRegistration);





