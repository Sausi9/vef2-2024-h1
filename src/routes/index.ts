import express, { Request, Response } from 'express';
export const indexRouter = express.Router();
import { getTeam, listTeams, createTeam, updateTeam, deleteTeam  } from '../lib/registrations.js';
import { listGames, createGame, getGame, updateGame  } from '../lib/events.js';
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
indexRouter.get('/teams', listTeams);


indexRouter.get('/teams/:slug', getTeam);


indexRouter.get('/games', listGames);
indexRouter.get('/games/:gameId', getGame);





