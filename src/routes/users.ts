import express, { Request, Response } from 'express';
import { listRegistrations, createRegistration, deleteRegistration } from '../lib/registrations.js';
import { listEvents, getEvent, createEvent, deleteEvent  } from '../lib/events.js';


export const userRouter = express.Router();


export async function userRoute(req: Request, res: Response) {
    return res.json([
        {
          href: '/events',
          methods: ['GET'],
        },
        {
          href: '/events/:id',
          methods: ['GET'],
        },
        {
          href: '/registrations',
          methods: ['GET','POST'],
        },
        {
          href: '/registrations/:id',
          methods: ['DELETE'],
        },
      ]);

}

userRouter.get('/', userRoute);


userRouter.get('/registrations', listRegistrations);
userRouter.post('/registrations', createRegistration);
userRouter.delete('/registrations/:id', deleteRegistration);

