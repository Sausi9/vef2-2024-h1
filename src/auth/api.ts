import express from 'express';
import jwt from 'jsonwebtoken';
import { catchErrors } from '../lib/catch-errors.js';
import { logger } from '../lib/logger.js';
import { validationCheck } from '../lib/validation.js';
import {
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameDoesNotExistValidator,
  usernameValidator,
} from '../lib/validation.js';
import { jwtOptions, tokenOptions } from './passport.js';
import { createUser, findByUsername} from './users.js';

import patch from 'express-ws/lib/add-ws-method.js';

/**
 * Skilgreinir API fyrir nýskráningu, innskráningu notanda, ásamt því að skila
 * upplýsingum um notanda og uppfæra þær.
 */


patch.default(express.Router);

export const apiRouter = express.Router();

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

apiRouter.post(
  '/register',
  usernameValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  catchErrors(registerRoute)
);

apiRouter.get('/login')
apiRouter.post(
  '/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  catchErrors(loginRoute)
);

