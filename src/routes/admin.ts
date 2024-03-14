import express from 'express';
export const adminRouter = express.Router();
import { listRegistrations, createRegistration,  deleteRegistration  } from '../lib/registrations.js';
import { listEvents, createEvent, getEvent, deleteEvent , updateEvent } from '../lib/events.js';
import { checkAuthenticated, checkNotAuthenticated } from '../app.js';
import { logger } from '../lib/logger.js';
import { deleteUser, listUsers , getUser, createUser} from '../lib/user.js';
import { requireAdmin } from '../auth/passport.js';



export async function indexRoute(req, res) {
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



adminRouter.post('/events' ,requireAdmin ,createEvent);

adminRouter.patch('/events/:id',  requireAdmin,updateEvent);
adminRouter.delete('/events/:id', requireAdmin, deleteEvent);

adminRouter.get('/registrations',listRegistrations);
adminRouter.post('/registrations', requireAdmin, createRegistration);
adminRouter.delete('/registrations/:id', requireAdmin,deleteRegistration);

adminRouter.get('/users', requireAdmin,listUsers);
adminRouter.post('/users',  requireAdmin, createUser);
adminRouter.delete('/users/:id',  requireAdmin ,deleteUser);

