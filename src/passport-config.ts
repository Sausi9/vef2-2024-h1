import {Strategy} from 'passport-local';
import bcrypt from 'bcrypt';
import { getDatabase } from './lib/db';


export function initialize(passport, getUserByName, getUserById){
    const authenticateUser = async (name, password, done) =>{
        const user = await getUserByName(name);
        if (user == null){
            return done(null, false, {message: 'No user with that name'});
        }

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }else{
                return done(null, false, {message: 'Password incorrect'});
            }

        }catch(e){
            return done(e);

        }

    }
    passport.use(new Strategy({usernameField: 'name'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    });

    const availableName = async(name, done) => {
        const user = await getUserByName(name);
        if(user == null){
            return done(null, false, {message: "Username is already taken"});
        }
        return done(null, true);
    }
}