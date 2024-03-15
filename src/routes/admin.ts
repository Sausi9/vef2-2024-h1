import express from 'express';
export const adminRouter = express.Router();
import { listRegistrations, createRegistration,  deleteRegistration, getRegistration  } from '../lib/registrations.js';
import { createEvent, deleteEvent , updateEvent } from '../lib/events.js';
import { deleteUser, listUsers, createUser } from '../lib/user.js';
import { requireAdmin, requireAuthentication } from '../auth/passport.js';



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


adminRouter.get('/admin', requireAdmin, indexRoute )

adminRouter.post('/events' ,requireAdmin ,createEvent);
adminRouter.patch('/events/:id',  requireAdmin,updateEvent);
adminRouter.delete('/events/:id', requireAdmin, deleteEvent);

adminRouter.get('/registrations', requireAuthentication, listRegistrations )
adminRouter.post('/registrations', requireAuthentication, createRegistration);
adminRouter.get('/registrations/:id', requireAuthentication, getRegistration);
adminRouter.delete('/registrations/:id', requireAuthentication, deleteRegistration);

adminRouter.get('/users', requireAdmin,listUsers);
adminRouter.post('/users',  requireAdmin, createUser);
adminRouter.delete('/users/:id',  requireAdmin ,deleteUser);

