import { Event, DatabaseEvent, Registration, USER } from '../types.js';

export function DatabaseEventMapper(potentialEvent: unknown): Event | null {
  const event = potentialEvent as Partial<DatabaseEvent> | null;

  if (!event || !event.id || !event.title || !event.place || !event.date || !event.imageURL) {
    return null;
  }

  const mapped: Event = {
    id: event.id,
    title: event.title,
    place: event.place,
    date: event.date,
  };

  return mapped;
}

export function EventMapper(potentialEvent: unknown): DatabaseEvent | null {
  const event = potentialEvent as Partial<Event> | null;

  if (!event) {
    return null;
  }
  if (!event || !event.id || !event.title || !event.place || !event.date) {
    return null;
  }

  // Assuming you have a mechanism to generate or handle imageURL when mapping from Event to DatabaseEvent
  const imageURL = ""; // Placeholder: Generate or assign the imageURL as needed

  const mapped: DatabaseEvent = {
    id: event.id,
    title: event.title,
    place: event.place,
    date: event.date,
    imageURL: imageURL,
  };

  return mapped;
}

export function RegistrationMapper(potentialRegistration: unknown): Registration | null {
  const registration = potentialRegistration as Partial<Registration> | null;

  if (!registration || !registration.id ||!registration.username|| !registration.eventTitle|| !registration.userId || !registration.eventId) {
    return null;
  }

  const mapped: Registration = {
    id: registration.id,
    username: registration.username,
    eventTitle: registration.eventTitle,
    userId: registration.userId,
    eventId: registration.eventId,
  };

  return mapped;
}

export function UserMapper(potentialUser: unknown): USER | null {
  const user = potentialUser as Partial<USER> | null;

  if (!user || !user.id || !user.name || !user.password) {
    return null;
  }

  const mapped: USER = {
    id: user.id,
    name: user.name,
    password: user.password,
  };

  return mapped;
}

// Add any additional mapper functions as needed for other types or specific use cases
