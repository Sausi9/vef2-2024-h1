import express, { Request, Response } from 'express';
export const indexRouter = express.Router();
import { getTeam, listTeams, createTeam, updateTeam, deleteTeam  } from '../lib/teams.js';
import { listGames, createGame, getGame, updateGame  } from '../lib/games.js';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { getUserByUserName } from '../lib/db.js';
import {users} from '../app.js';





export async function indexRoute(req: Request, res: Response) {
    return res.json([
        {
          href: '/teams',
          methods: ['GET'],
        },
        {
          href: '/teams/:slug',
          methods: ['GET'],
        },
        {
          href: '/games',
          methods: ['GET'],
        },
      ]);

   
}

indexRouter.get('/', indexRoute);
indexRouter.get('/teams', listTeams);


indexRouter.get('/teams/:slug', getTeam);


indexRouter.get('/games', listGames);
indexRouter.get('/games/:gameId', getGame);





