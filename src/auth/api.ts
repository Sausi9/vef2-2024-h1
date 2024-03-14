import express from 'express';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catch-errors.js';
import { logger } from '../lib/logger.js';
import { validationCheck } from '../lib/validation.js';
import {
  atLeastOneBodyValueValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameDoesNotExistValidator,
  usernameValidator,
} from '../lib/validation.js';
import { jwtOptions, requireAdmin, tokenOptions } from './passport.js';
import { createUser, findById, findByUsername} from './users.js';

import patch from 'express-ws/lib/add-ws-method.js';

/**
 * Skilgreinir API fyrir nýskráningu, innskráningu notanda, ásamt því að skila
 * upplýsingum um notanda og uppfæra þær.
 */


patch.default(express.Router);

export const apiRouter = express.Router();

const orderConnections = new Map();
const adminConnections = [];

function returnResource(req, res) {
  return res.json(req.resource);
}

async function registerRoute(req, res) {
  const { username, password = '' } = req.body;

  const result = await createUser(username, password);

  delete result.password;

  return res.status(201).json(result);
}

async function loginRoute(req, res) {
  const { username } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    logger.error('Unable to find user', username);
    return res.status(500).json({});
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  delete user.password;

  return res.json({
    user,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}

apiRouter.ws('/admin', (ws, req) => {
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




apiRouter.post(
  '/register',
  usernameValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  catchErrors(registerRoute)
);

apiRouter.post(
  '/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  catchErrors(loginRoute)
);

