import express, { Request, Response } from 'express';
import { listEvents, getEvent } from '../lib/events.js';
import jwt from 'jsonwebtoken';
import patch from 'express-ws/lib/add-ws-method.js';
import { jwtOptions, requireAdmin } from '../auth/passport.js';


patch.default(express.Router);

export const indexRouter = express.Router();

const orderConnections = new Map();
const adminConnections = [];

function returnResource(req, res) {
  return res.json(req.resource);
}



indexRouter.ws('/admin', (ws, req) => {
  const auth = req.headers.authorization;
  const token = auth.replace(/bearer /i, '');

  try {
    jwt.verify(token, jwtOptions.secretOrKey);
  } catch (e) {
    // throws if not valid
    ws.send(JSON.stringify({ error: 'invalid token' }));
    ws.close();
  }

  adminConnections.push(ws);
  ws.on('close', () => {
    const index = adminConnections.indexOf(ws);
    adminConnections.splice(index, 1);
  });

  ws.send(JSON.stringify({ status: 'loggedin' }));
});

function broadcastToAdmins(msg) {
  adminConnections.forEach((client) => {
    client.send(JSON.stringify(msg));
  });
}


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





