import {
    Team,
    Game,
    USER,
  } from '../types.js';
  


  export function TeamMapper(  potentialTeam: unknown ): Team| null {
    const team= potentialTeam as Partial<Team> | null;
  
    if (!team  ) {
      return null;
    }
  
    
    const mapped: Team = {
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description ?? undefined,
      created: team.created,
      updated: team.updated,
      
    };
  
    return mapped;
  }
  
  export function TeamsMapper(
    potentialTeams: unknown,
  ): Array<Team> {
    const teams = potentialTeams as Array<unknown> | null;
  
    if (!teams) {
      return [];
    }
  
    const mapped = teams.map((team) => TeamMapper(team));
  
    return mapped.filter((i): i is Team => Boolean(i));
  }


  export function GameMapper(potentialGame: unknown): Game | null {
    const game = potentialGame as Partial<Game> | null;
  
    if (!game || !game.id || !game.date|| !game.home || !game.away || !game.home_score || !game.away_score) {
      return null;
    }
  
    const mapped: Game = {
      id: game.id,
      date: game.date,
      home: game.home,
      away: game.away,
      home_score: game.home_score ,
      away_score: game.away_score ,
      created: game.created,
      updated: game.updated,
     
    };
  
    return mapped;
  }
  
  export function GamesMapper(potentialGames: unknown): Array<Game> {
    const games = potentialGames as Array<unknown> | null;
  
    if (!games || !Array.isArray(games)) {
      return [];
    }
  
    
  
    const mapped = games.map(GameMapper);
  
    return mapped.filter((i): i is Game => Boolean(i));
  }



  export function UserMapper(potentialUser: unknown): USER | null {
    const user = potentialUser as Partial<USER> | null;
  
    if (!user || !user.id || !user.name|| !user.password ) {
      return null;
    }
  
    const mapped:USER = {
      id: user.id,
      name: user.name,
      password: user.password,
     
    };
  
    return mapped;
  }
  