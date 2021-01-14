import express from "express";
import passport from "passport";
import passportLocal from "passport-local";
import passportJwt, { ExtractJwt } from "passport-jwt";
import JWT from "jsonwebtoken";
import ejs from "ejs";
import dotenv from "dotenv";

// Model
import User from "../models/User";

const router = express.Router();
dotenv.config();

const JwtStrategy = passportJwt.Strategy;
const LocalStrategy = passportLocal.Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Authenticate user
passport.use(
  "jwt",
  new JwtStrategy(
    {
      secretOrKey: process.env.SECRET_TOKEN,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
    },
    async (accessToken, done) => {
      try {
        // Check if user is inactive
        if (!accessToken.payload.active) {
          return done(null, false, { message: "Your are inactive" });
        }
        return done(null, accessToken.payload);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  "teacher",
  new JwtStrategy(
    {
      secretOrKey: process.env.SECRET_TOKEN,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
    },
    async (accessToken, done) => {
      try {
        // Check if user is inactive
        if (accessToken.payload.role !== "teacher") {
          return done(null, false, {
            message: "Your are not authorized to access this page",
          });
        }
        return done(null, accessToken.payload);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// This is role based handler
passport.use(
  "admin",
  new JwtStrategy(
    {
      secretOrKey: process.env.SECRET_TOKEN,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
    },
    async (accessToken, done) => {
      try {
        // Check if user is inactive
        if (accessToken.payload.role !== "ADMIN") {
          return done(null, false, {
            message: "Your are not authorized to access this page",
          });
        }
        return done(null, accessToken.payload);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Passport middleware to handle User register
passport.use(
  "signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      // Check confirm password
      if (req.body.password != req.body.confirmPassword) {
        return done(null, false, {
          message: "Password and confirm password are not match",
        });
      }

      try {
        const newUser = req.body;
        // Save the information provided by user to the database
        const user = new User(newUser);

        // Validate user input
        const validation = await user.Validate(newUser);
        if (validation.error) {
          return done(null, false, {
            message: validation.error.details[0].message,
          });
        }

        user.save(async (error, user) => {
          if (error) {
            return done(null, false, {
              message: error.message,
            });
          }

          // This token contain account activation information
          const confirmToken = await JWT.sign(
            { email, active: true },
            process.env.SECRET_TOKEN,
            {
              expiresIn: 300,
            }
          );
          // Email template
          const confirmEmail = await ejs.renderFile("public/activate.ejs", {
            subject: "Activate your account",
            domain: req.headers.host,
            confirmToken: confirmToken,
          });

          // Send confirm email to user to verify
          user.sendConfirmEmail(confirmEmail, (error, info) => {
            if (error) {
              return done(null, false, { message: info });
            }
          });

          return done(null, user, {
            message: "Please check your email to activate your account",
          });
        });
      } catch (error) {
        return done(null, false, { message: error.message });
      }
    }
  )
);

// Create a passport middleware to handle User login
passport.use(
  "signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      let user;
      try {
        user = await User.findOne({ email: email });
        if (!user) return done(null, false, { message: "User not found" });
        //Validate password and make sure it matches with the corresponding hash stored in the database
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Wrong email or password" });
        }
        // Check user active status
        if (!user.active)
          return done(null, false, {
            message:
              "Your account is inactive. Please check your email to activate your account",
          });
        // Create user access token
        const accessToken = user.generateAccessToken();

        return done(null, user, { accessToken: accessToken });
      } catch (error) {
        return done(null, false, { message: error.message });
      }
    }
  )
);

export default router;
