import express, { Request, Response } from 'express';
import { listEvents, getEvent } from '../lib/events.js';
import jwt from 'jsonwebtoken';
import patch from 'express-ws/lib/add-ws-method.js';
import { jwtOptions, requireAdmin } from '../auth/passport.js';


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





