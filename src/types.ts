export type Event = {
  id: string;
  title: string;
  place: string;
  description: string;
}

export type DatabaseEvent = {
  id: string;
  title: string;
  place: string;
  description: string;
  imageURL: string;
}

export type Registration = {
  id: string;
  userId: string;
  eventId: string;
}

export type USER = {
  id: string;
  name: string;
  password: string;

};
  
  
