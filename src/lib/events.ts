import { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import {
  conditionalUpdate,
  getGameByGameId,
  insertGame,
  getGames,
} from './db.js';
import { GameMapper } from './mappers.js';
import {
  atLeastOneBodyValueValidator,
  genericSanitizerMany,
  stringValidator,
  validationCheck,
  xssSanitizerMany,
} from './validation.js';
import { Game } from '../types.js';



export async function listGames(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    
    const games = await getGames();
  
    if (!games) {
      return next(new Error('unable to get games'));
    }
  
    return res.json(games);
  }
  
  export async function getGame(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {gameId } = req.params;


    const game = await getGameByGameId(gameId);
  

    if (!game) {
      return next();
    }
  
    return res.json(game);
  }


  export async function createGamesHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { date, home, away, home_score, away_score } = req.body;
  

    const gameToCreate: Omit<Game, 'id'> = {
      date,
      home,
      away,
      home_score,
      away_score,
    };
  
    const createdGame = await insertGame(
      gameToCreate,
      false,
    );
  
    if (!createdGame) {
      return next(new Error('unable to create game'));
    }
  
    return res.json(GameMapper(createdGame));
  }
  
  const gameFields = ['date', 'home', 'away', 'home_score', 'away_score'];
  
  export const createGame = [
    stringValidator({ field: 'date', maxLength: 64 }),
    stringValidator({ field: 'home', maxLength: 64 }),
    stringValidator({ field: 'away', maxLength: 64 }),
    body('home_score')
      .isFloat({ min: 0, max: 100 })
      .withMessage('score must be a number equal to or bigger than 0'),
    body('away_score')
      .isFloat({ min: 0, max: 100 })
      .withMessage('score must be a number equal to or bigger than 0'),
    xssSanitizerMany(gameFields),
    validationCheck,
    genericSanitizerMany(gameFields),
    createGamesHandler,
  ].flat();
  
  export const updateGame = [
    stringValidator({ field: 'date', maxLength: 64, optional: true }),
    stringValidator({ field: 'home', maxLength: 64, optional: true }),
    stringValidator({ field: 'away', maxLength: 64, optional: true }),
    body('home_score')
      .isFloat({ min: 0, max: 100 })
      .withMessage('score must be a number equal to or bigger than 0')
      .optional(),
    body('away_score')
      .isFloat({ min: 0, max: 100 })
      .withMessage('score must be a number equal to or bigger than 0')
      .optional(),
    atLeastOneBodyValueValidator(gameFields),
    xssSanitizerMany(gameFields),
    validationCheck,
    genericSanitizerMany(gameFields),
    updateGameHandler,
  ].flat();
  
  export async function updateGameHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { gameId } = req.params;
    
    const game = await getGameByGameId(gameId);
  
    if (!game) {
      return next();
    }
  
    const {
      gameId: newGameId,
      date,
      home,
      away,
      home_score,
      away_score,
    } = req.body;
  
    const fields = [
      typeof newGameId === 'string' && newGameId ? 'id' : null,
      typeof date === 'string' && date ? 'date' : null,
      typeof home === 'string' && home ? 'home' : null,
      typeof away === 'string' && away ? 'away' : null,
      typeof home_score === 'string' && home_score ? 'home_score' : null,
      typeof away_score === 'string' && away_score ? 'away_score' : null,
    ];
  
    const values = [
      typeof newGameId === 'string' && newGameId ? newGameId : null,
      typeof date === 'string' && date ? date : null,
      typeof home === 'string' && home ? home : null,
      typeof away === 'string' && away ? away : null,
      typeof home_score === 'string' && home_score ? home_score : null,
      typeof away_score === 'string' && away_score ? away_score : null,
      
    ];
  
    const updated = await conditionalUpdate('games', game.id, fields, values);
    console.log('updated :>> ', updated);
    if (!updated) {
      return next(new Error('unable to update game'));
    }
  
    const updatedGame = GameMapper(updated.rows[0]);
    return res.json(updatedGame);
  }
  