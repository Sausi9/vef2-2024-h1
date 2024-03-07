import express, { Request, Response } from 'express';
export const apiRouter = express.Router();
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



apiRouter.get('/', indexRoute);
apiRouter.get('/teams', listTeams);
apiRouter.post('/teams', createTeam);

apiRouter.get('/teams/:slug', getTeam);
apiRouter.patch('/teams/:slug', updateTeam);
apiRouter.delete('/teams/:slug', deleteTeam);

apiRouter.get('/games', listGames);
apiRouter.post('/games', createGame);
apiRouter.get('/games/:gameId', getGame);
apiRouter.patch('/games/:gameid', updateGame);
