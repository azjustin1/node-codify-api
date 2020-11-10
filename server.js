import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";

// // API server config
dotenv.config();
const SERVER = process.env.SERVER;
const PORT = process.env.PORT;
const DB_CONNECTION = process.env.MONGODB_PORT;
const ATLAS_URL = process.env.ATLAS_URL;
const app = express();
app.use(passport.initialize());

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({ secret: process.env.SECRET_STRING }));
app.use(cors());
app.use(morgan("tiny"));
app.set("views", __dirname + "/public");

// Routes
import routes from "./routes/routes";
import secureRoutes from "./routes/secureRoutes";
import adminRouter, { adminBro } from "./config/admin";

app.use(routes);
// This route require authenticate
app.use(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  secureRoutes
);
app.use(adminBro.options.rootPath, adminRouter);

import bcrypt, { genSalt } from "bcrypt";

app.get("/hash", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash("123123", salt);
  res.send(hash);
});

const runServer = async () => {
  // DB config
  await mongoose.connect(DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  // Listen
  await app.listen(PORT, () => {
    console.log(`Server is running on server http://localhost:${PORT}`);
  });
};

runServer();
