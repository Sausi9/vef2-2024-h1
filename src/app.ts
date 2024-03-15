import dotenv from 'dotenv';
import express, {Request, Response } from 'express';
import { indexRouter } from './routes/index.js';
import { cors } from './lib/cors.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import passport from './auth/passport.js';
import expressWs from 'express-ws';
import { environment } from './lib/environment.js';
import { logger } from './lib/logger.js';
import { getDatabase } from './lib/db.js';
import { adminRouter } from './routes/admin.js';
import { apiRouter } from './auth/api.js';


dotenv.config();

const env = environment(process.env, logger);

if (!env) {
  process.exit(1);
}

const { port , sessionSecret } = env;
const path = dirname(fileURLToPath(import.meta.url));

const app = express();


expressWs(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

app.use(express.json());
app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false}));




app.use(express.json());
app.use(passport.initialize());
app.use(cors);



app.use(apiRouter);
app.use(adminRouter);
app.use(indexRouter);






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












