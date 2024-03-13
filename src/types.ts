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

export type RegistrationDetails = {
  id: string; // Registration ID
  user: {
    id: string; // User ID
    name: string; // User's name, assuming 'username' in your current type refers to the user's name
  };
  event: {
    id: string; // Event ID
    title: string; // Event title
  };
};



export type USER = {
  id: string;
  name: string;
  password: string;

};
  
  
