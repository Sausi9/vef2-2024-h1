import dotenv from 'dotenv';
import express, {Request, Response } from 'express';
import { indexRoute, indexRouter } from './routes/index.js';
import { cors } from './lib/cors.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import {USER} from './types.js';
import passport from 'passport';
import {initialize} from './passport-config.js'; 
import flash from 'express-flash';
import session from 'express-session';
import { environment } from './lib/environment.js';
import { logger } from './lib/logger.js';
import methodOverride from 'method-override';
import { getDatabase } from './lib/db.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

export const users: Array<USER> = []
const db = getDatabase();
initialize(passport, db.getUserByUserName, db.getUserByUserId);


const env = environment(process.env, logger);

if (!env) {
  process.exit(1);
}

const { port , sessionSecret } = env;

const path = dirname(fileURLToPath(import.meta.url));


const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
};
const app = express();

app.use(express.json());
app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false}));



app.use(flash());
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session())


app.use(cors);



app.use('/',indexRouter);
app.use('/',adminRouter);





app.get('/login', checkNotAuthenticated,(req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated ,passport.authenticate('local', {
  successRedirect:  '/admin',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})


app.post('/register',  checkNotAuthenticated,async (req, res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = db.getUserByUserName(req.body.name);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      password: hashedPassword
    })
    res.redirect('/login')
  }catch{
    res.redirect('/register')
  }
  console.log(users)
  
})

export function checkAuthenticated(req,res, next){
  if(req.isAuthenticated()){
    return next()
  }

  res.redirect('/login')
}

export function checkNotAuthenticated(req,res, next){
  if(req.isAuthenticated()){
    res.redirect('/')
  }
  next()
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'not found' });
});



app.use((err: Error, req: Request, res: Response) => {
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    err.status === 400 &&
    'body' in err
  ) {
    return res.status(400).json({ error: 'invalid json' });
  }

  console.error('error handling route', err);
  return res
    .status(500)
    .json({ error: err.message ?? 'internal server error' });
});












