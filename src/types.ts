export type TeamImport = {
    name: string;
    slug: string;
    description?: string;
  };


  export type Link = {
    href: string;
  };
  
  export type Links = {
    self?: Link;
    next?: Link;
    prev?: Link;
    first?: Link;
    last?: Link;
  };
  
  export type Team= {
    id: number;
    /** Title of the department */
    name: string;
    /** Slug of the department */
    slug: string;
    /** Description of the department */
    
    description?: string;
    /** List of courses */
    /** Created date as ISO 8601 string */
    created?: string;
    /** Updated date as ISO 8601 string */
    updated?: string;
    //_links?: Links;
  };




  export type Game = {
    id: number;
    /** Title of the course. */
    date: string;
    /** Units for finishing course. */
    home: string;
    away: string;
    home_score: string;
    away_score: string;
    created?: string;

    updated?: string;
  };


  export type USER = {
    id: string;
    /** Title of the course. */
    name: string;
    /** Units for finishing course. */
    password: string;
    
  };
  
  
