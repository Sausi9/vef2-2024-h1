import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import slugify from 'slugify';
import xss from 'xss';

import {
  getDatabase,
} from './db.js';

import {
  comparePasswords,
  findByUsername,
} from '../auth/users.js';

import { logger } from '../lib/logger.js';

/**
 * Checks to see if there are validation errors or returns next middlware if not.
 * @param {object} req HTTP request
 * @param {object} res HTTP response
 * @param {function} next Next middleware
 * @returns Next middleware or validation errors.
 */
export function validationCheck(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const errors = validation.array();
    const notFoundError = errors.find((error) => error.msg === 'not found');
    const serverError = errors.find((error) => error.msg === 'server error');

    let status = 400;

    if (serverError) {
      status = 500;
    } else if (notFoundError) {
      status = 404;
    }

    return res.status(status).json({ errors });
  }

  return next();
}

export function atLeastOneBodyValueValidator(fields: Array<string>) {
  return body().custom(async (value, { req }) => {
    const { body: reqBody } = req;

    let valid = false;

    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];

      if (field in reqBody && reqBody[field] != null) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      return Promise.reject(
        new Error(`require at least one value of: ${fields.join(', ')}`),
      );
    }
    return Promise.resolve();
  });
}

export const xssSanitizer = (param: string) =>
  body(param).customSanitizer((v) => xss(v));

export const xssSanitizerMany = (params: string[]) =>
  params.map((param) => xssSanitizer(param));

export const genericSanitizer = (param: string) => body(param).trim().escape();

export const genericSanitizerMany = (params: string[]) =>
  params.map((param) => genericSanitizer(param));

export const stringValidator = ({
  field = '',
  valueRequired = true,
  maxLength = 0,
  optional = false,
} = {}) => {
  const val = body(field)
    .trim()
    .isString()
    .isLength({
      min: valueRequired ? 1 : undefined,
      max: maxLength ? maxLength : undefined,
    })
    .withMessage(
      [
        field,
        valueRequired ? 'required' : '',
        maxLength ? `max ${maxLength} characters` : '',
      ]
        .filter((i) => Boolean(i))
        .join(' '),
    );

  if (optional) {
    return val.optional();
  }
  return val;
};

export const eventDoesNotExistValidator = body('id').custom(
  async (id) => {
    if (await getDatabase()?.getEvent(id)) {
      return Promise.reject(new Error('Event with title already exists'));
    }
    return Promise.resolve();
  },
);

export const registrationDoesNotExistValidator = body('id').custom(
  async (id) => {
    if (await getDatabase()?.getRegistration(id)) {
      return Promise.reject(new Error('Registration with ID already exists'));
    }
    return Promise.resolve();
  },
);

export const usernameValidator = body('username')
  .isLength({ min: 1, max: 256 })
  .withMessage('username is required, max 256 characters');

  export const passwordValidator = body('password')
  .isLength({ min: 1, max: 256 })
  .withMessage('password is required, min 10 characters, max 256 characters');


  export const usernameDoesNotExistValidator = body('username').custom(
    async (username) => {
      const user = await findByUsername(username);
  
      if (user) {
        return Promise.reject(new Error('username already exists'));
      }
      return Promise.resolve();
    }
  );
  
  export const usernameAndPaswordValidValidator = body('username').custom(
    async (username, { req: { body: reqBody } = {} }) => {
      // Can't bail after username and password validators, so some duplication
      // of validation here
      // TODO use schema validation instead?
      const { password } = reqBody;
  
      if (!username || !password) {
        return Promise.reject(new Error('skip'));
      }
  
      let valid = false;
      try {
        const user = await findByUsername(username);
        valid = await comparePasswords(password, user.password);
      } catch (e) {
        // Here we would track login attempts for monitoring purposes
        logger.info(`invalid login attempt for ${username}`);
      }
  
      if (!valid) {
        return Promise.reject(new Error('username or password incorrect'));
      }
      return Promise.resolve();
    }
  );

