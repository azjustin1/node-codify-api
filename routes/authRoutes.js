import express from 'express'
import passport from 'passport'
import passportLocal from 'passport-local'
import passportJwt, { ExtractJwt } from 'passport-jwt'
import dotenv from 'dotenv'

// Model
import User from '../models/User'


const router = express.Router()
dotenv.config()

const JwtStrategy = passportJwt.Strategy
const LocalStrategy = passportLocal.Strategy

//This verifies that the token sent by the user is valid
passport.use(new JwtStrategy({
    secretOrKey: process.env.SECRET_TOKEN,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),

}, async (token, done) => {
    console.log(token)
    try {
        return done(null, token.user)
    } catch (err) {
        return done(err)
    }
}));

// Passport middleware to handle User register
passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (req.body.password != req.body.confirmPassword) {
        console.log('Not match')
        return done(null, false, { message: 'Password and confirm password does not match' })
    }

    const user = await User.findOne({ email: req.body.email })
    if (user) {
        //If the user found in the database, return a message
        return done(null, false, { message: 'The email already exists' });
    }

    try {
        const newUser = { email, password }
        // Save the information provided by user to the database
        const user = new User(newUser)
        const validation = await user.Validate(newUser)
        if (validation.error) {
            return done(null, false, { message: validation.error.details[0].message })
        }
        user.save((user) => {

            return done(null, user, { message: 'Register successfully' })
        })
    } catch (error) {
        return done(null, false, { message: error.message })
    }
}))

// Create a passport middleware to handle User login
passport.use('signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, async (email, password, done) => {
    try {
        const userInput = new User({ email, password })
        const validation = await userInput.Validate({ email, password });
        // Check the email and password input
        if (validation.error) {
            return done(null, false, { message: validation.error.details[0].message })
        }

        //Find the user associated with the email provided by the user
        const user = await User.findOne({ email: email });
        if (!user) {
            //If the user isn't found in the database, return a message
            return done(null, false, { message: 'User not found' });
        }

        //If the passwords match, it returns a value of true.
        await User.findOne({ email: email }, async (err, user) => {
            if (err) return done(null, false, { message: 'User not found' });
            //Validate password and make sure it matches with the corresponding hash stored in the database
            await user.comparePassword(password, (err, isMatch) => {
                console.log(isMatch)
                if (err) { return done(null, false, { message: 'Wrong email or password' }) }
                if (!isMatch) { return done(null, false, { message: 'Wrong email or password' }) }
                return done(null, user, { message: 'Login successfully' })
            })
        })
    } catch (error) {
        return done(null, false, { message: error });
    }
}));


export default router