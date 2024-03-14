export type Event = {
  id: string;
  title: string;
  place: string;
  date: string;
}

export type DatabaseEvent = {
  id: string;
  title: string;
  place: string;
  date:string;
  imageURL: string;
}

export type Registration = {
  id: string;
  eventTitle: string;
  username: string;
  userId: number;
  eventId: number;
}


export type USER = {
  id: string;
  name: string;
  password: string;

};
  
  
