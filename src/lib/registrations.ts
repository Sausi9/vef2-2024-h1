import { NextFunction, Request, Response } from 'express';
import { getDatabase} from './db.js';
import { stringValidator, registrationDoesNotExistValidator, xssSanitizer,validationCheck,genericSanitizer, atLeastOneBodyValueValidator} from './validation.js';
import slugify from 'slugify';

import { Registration } from '../types.js';
import { RegistrationMapper } from './mappers.js';
import { getUserByName } from './user.js';


export async function listRegistrations(req: Request, res: Response, next: NextFunction) {
    const registrations = await getDatabase()?.getRegistrations();

    if (!registrations) {
        return next(new Error('unable to get registrations'));
     
    }

  return res.json(registrations);
}

export async function getRegistration(req: Request, res: Response) {

  const registration = await getDatabase()?.getRegistration(req.params.id);

  if (!registration) {
    return res.status(404).json({ error: 'registration not found' });
  }

  return res.json(registration);
}


export async function createRegistrationHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {

    const eventTitle = req.body.eventTitle;
    const username = req.body.username;

  
    const createdRegistration= await getDatabase()?.insertRegistration(username,eventTitle);
  
    if (!createdRegistration) {
      return next(new Error('unable to create registration'));
    }
  
    return res.status(201).json(createdRegistration);
  }

export const createRegistration = [
    stringValidator({ field: 'username', maxLength: 64 }),
    stringValidator({ field: 'eventTitle', maxLength: 64 }),
    registrationDoesNotExistValidator,
    xssSanitizer('username'),
    xssSanitizer('eventTitle'),
    validationCheck,
    genericSanitizer('username'),
    genericSanitizer('eventTitle'),
    createRegistrationHandler,
  ];

  export async function deleteRegistration(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params; // Assuming 'id' is the parameter in your route for registration ID
  
    // Assuming getRegistrationById is a function that retrieves a registration by its ID
    const registration = await getDatabase()?.getRegistration(id);
  
    if (!registration) {
      // If the registration does not exist, send a 404 Not Found response
      return res.status(404).json({ error: "Registration not found" });
    }
  
    // Assuming deleteRegistrationById is a function that deletes a registration by its ID
    const result = await getDatabase()?.deleteRegistration(id);
  
    if (!result) {
      // If deletion was unsuccessful, handle the error (e.g., log it) and send a 500 Internal Server Error response
      console.error(`Failed to delete registration with ID ${id}`);
      return next(new Error('Unable to delete registration'));
    }
  
    // If deletion was successful, send a 204 No Content response to indicate success without returning any content
    return res.status(200).json({message: "Successfully deleted registration"});
  }
  


