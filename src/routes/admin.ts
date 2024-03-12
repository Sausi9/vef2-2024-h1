import express, { Request, Response } from 'express';
export const adminRouter = express.Router();
import { getTeam, listTeams, createTeam, updateTeam, deleteTeam  } from '../lib/teams.js';
import { listGames, createGame, getGame, updateGame  } from '../lib/games.js';





export async function indexRoute(req: Request, res: Response) {
    return res.json([
        {
          href: '/teams',
          methods: ['GET', 'POST'],
        },
        {
          href: '/teams/:slug',
          methods: ['GET', 'PATCH', 'DELETE'],
        },
        {
          href: '/games',
          methods: ['GET', 'POST', 'PATCH'],
        },
      ]);

   
}



adminRouter.get('/', indexRoute);
adminRouter.get('/teams', listTeams);
adminRouter.post('/teams', createTeam);

adminRouter.get('/teams/:slug', getTeam);
adminRouter.patch('/teams/:slug', updateTeam);
adminRouter.delete('/teams/:slug', deleteTeam);

adminRouter.get('/games', listGames);
adminRouter.post('/games', createGame);
adminRouter.get('/games/:gameId', getGame);
adminRouter.patch('/games/:gameid', updateGame);
