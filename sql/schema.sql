CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  place VARCHAR(200) NOT NULL,
  event_image VARCHAR(300) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.users (
  id serial primary key,
  name CHARACTER VARYING(64) NOT NULL UNIQUE,
  password character varying(256) NOT NULL,
  admin BOOLEAN DEFAULT false
);

CREATE TABLE public.registrations (
  id SERIAL PRIMARY KEY,
  event_title VARCHAR(100) NOT NULL REFERENCES events(title),
  username VARCHAR(64) NOT NULL REFERENCES users(name),
  user_id integer,
  event_id integer,
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_event_id FOREIGN KEY (event_id) REFERENCES events(id)
);