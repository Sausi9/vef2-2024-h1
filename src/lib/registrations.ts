import { NextFunction, Request, Response } from 'express';
import { getDatabase} from './db.js';
import { stringValidator, teamDoesNotExistValidator, xssSanitizer,validationCheck,genericSanitizer, atLeastOneBodyValueValidator} from './validation.js';
import slugify from 'slugify';

import { Registration } from '../types.js';
import { RegistrationMapper } from './mappers.js';


export async function listRegistrations(req: Request, res: Response, next: NextFunction) {
    const registrations = await getDatabase()?.getRegistrations();

    if (!registrations) {
        return next(new Error('unable to get registrations'));
     
    }

  return res.json(registrations);
}


export async function createRegistrationHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const id  = req.body.id;
    const user_id = req.body.userId;
    const event_id = req.body.eventId;
  
    const registrationToCreate: Omit<Registration, 'id'> = {
      userId: user_id,
      eventId: event_id
    };
  
    const createdRegistration= await getDatabase()?.insertRegistration(registrationToCreate);
  
    if (!createdRegistration) {
      return next(new Error('unable to create registration'));
    }
  
    return res.status(201).json(createdRegistration);
  }

export const createRegistration = [
    stringValidator({ field: 'user_id', maxLength: 64 }),
    stringValidator({
      field: '',
      valueRequired: false,
      maxLength: 1000,
    }),
    teamDoesNotExistValidator,
    xssSanitizer('name'),
    xssSanitizer('description'),
    validationCheck,
    genericSanitizer('name'),
    genericSanitizer('description'),
    createRegistrationHandler,
  ];

  export async function deleteRegistration(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const registration = await getDatabase()?.getRegistration(id);
  
    if (!registration) {
      return next();
    }
  
    const result = await deleteTeamBySlug(slug);
  
    if (!result) {
      return next(new Error('unable to delete department'));
    }
  
    return res.status(204).json({});
  }


