import { USER } from "../types.js";
import { xssSanitizer, genericSanitizer,validationCheck, stringValidator } from "./validation.js";
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { getDatabase } from './db.js';

const db = getDatabase();


export async function listUsers(req: Request, res: Response, next: NextFunction) {
    const teams = await db.getUsers();

    if (!teams) {
        return next(new Error('unable to get users'));
     
    }

  return res.json(teams);
}


export async function createUserHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const name  = req.body.name;
    const password = await bcrypt.hash(req.body.password, 10)
    const admin = false;
    
    
    const userToCreate: Omit<USER, 'id'> = {
      name,
      password,
      admin,
    };
  
    const createdUser = await db.insertUser(userToCreate);
  
    
    if (!createdUser) {
      return next(new Error('unable to create user'));
    }
  
    return res.status(201).json(createdUser);
  }

export const createUser = [
    stringValidator({ field: 'name', maxLength: 64 }),
    stringValidator({
      field: 'password',
      maxLength: 256,
    }),
    xssSanitizer('name'),
    xssSanitizer('password'),
    validationCheck,
    genericSanitizer('name'),
    genericSanitizer('password'),
    createUserHandler,
  ];


export async function getUserByName(req: Request,
    res: Response,
    next: NextFunction,
)
{
    const name = req.body.name;

    const user = await db.getUserByUserName(name);

    if (!user) {
        return next();
    }

    return res.json(user);
    
}


export async function deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const username = req.body.username;
    const user = await db.getUserByUserName(username);
  
    if (!user) {
      return next();
    }
  
    const result = await db.deleteUserByUsername(username);
  
    if (!result) {
      return next(new Error('unable to delete user'));
    }
  
    return res.status(204).json({});
}

export async function getUser(req: Request,
    res: Response,
    next: NextFunction,
)
{
    const {username} = req.params;

    const team = await db.getUserByUserName(username);

    if (!team) {
        return next();
    }

    return res.json(team);
    
}


