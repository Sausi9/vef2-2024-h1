import express from 'express';
export const adminRouter = express.Router();
import { getTeam, listTeams, createTeam, updateTeam, deleteTeam  } from '../lib/registrations.js';
import { listGames, createGame, getGame, updateGame  } from '../lib/events.js';
import { checkAuthenticated, checkNotAuthenticated } from '../app.js';
import { logger } from '../lib/logger.js';



export async function indexRoute(req, res) {
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



adminRouter.get('/admin', checkAuthenticated,indexRoute);
adminRouter.post('/teams', checkAuthenticated ,createTeam);

adminRouter.patch('/teams/:slug', checkAuthenticated, updateTeam);
adminRouter.delete('/teams/:slug', checkAuthenticated, deleteTeam);

adminRouter.post('/games', checkAuthenticated, createGame);

adminRouter.patch('/games/:gameid', checkAuthenticated,updateGame);
