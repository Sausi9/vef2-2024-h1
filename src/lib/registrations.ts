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


export async function getTeam(req: Request,
    res: Response,
    next: NextFunction,
)
{
    const { slug } = req.params;

    const team = await getTeamBySlug(slug);

    if (!team) {
        return next();
    }

    return res.json(team);
    
}


export const updateTeam = [
    stringValidator({ field: 'name', maxLength: 64, optional: true }),
    stringValidator({
      field: 'description',
      valueRequired: false,
      maxLength: 1000,
      optional: true,
    }),
    atLeastOneBodyValueValidator(['name', 'description']),
    xssSanitizer('name'),
    xssSanitizer('description'),
    validationCheck,
    updateTeamHandler,
  ];
  
  export async function updateTeamHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { slug } = req.params;
    const team= await getTeamBySlug(slug);
  
    if (!team) {
      return next();
    }
    
  
    const {name, description} = req.body;
  
    const fields = [
      typeof name === 'string' && name ? 'name' : null,
      typeof name === 'string' && name ? 'slug' : null,
      typeof description === 'string' && description ? 'description' : null,
    ];
  
    const values = [
      typeof name === 'string' && name ? name : null,
      typeof name === 'string' && name? slugify(name).toLowerCase() : null,
      typeof description === 'string' && description ? description : null,
    ];
  
    const updated = await conditionalUpdate(
      'teams',
      team.id,
      fields,
      values,
    );
  
    if (!updated) {
      return next(new Error('unable to update department'));
    }
  
    const updatedDepartment = TeamMapper(updated.rows[0]);
    return res.json(updatedDepartment);
  }

  export async function deleteTeam(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { slug } = req.params;
    const department = await getTeamBySlug(slug);
  
    if (!department) {
      return next();
    }
  
    const result = await deleteTeamBySlug(slug);
  
    if (!result) {
      return next(new Error('unable to delete department'));
    }
  
    return res.status(204).json({});
  }


