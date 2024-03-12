import express, { Request, Response } from 'express';
export const indexRouter = express.Router();
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



indexRouter.get('/', indexRoute);
indexRouter.get('/teams', listTeams);
indexRouter.post('/teams', createTeam);

indexRouter.get('/teams/:slug', getTeam);
indexRouter.patch('/teams/:slug', updateTeam);
indexRouter.delete('/teams/:slug', deleteTeam);

indexRouter.get('/games', listGames);
indexRouter.post('/games', createGame);
indexRouter.get('/games/:gameId', getGame);
indexRouter.patch('/games/:gameid', updateGame);




