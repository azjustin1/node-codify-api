import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser, { urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";

// // API server config
dotenv.config();
const SERVER = process.env.SERVER;
const PORT = process.env.PORT;
const ROBO3T = process.env.ROBO3T;
const ATLAS_URL = process.env.ATLAS_URL;
const DB_CONNECTION = ROBO3T;

const app = express();
app.use(session({ secret: process.env.SECRET_STRING }));
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(morgan("tiny"));
app.set("views", __dirname + "/public");

// Routes
import router from "./routes/routes";
import userRouter from "./routes/userRoutes";
// import adminRouter, { adminBro } from "./config/admin";
import classroomRouter from "./routes/classroomRoutes";
import exerciseRouter from "./routes/exerciseRoutes";
import codeRouter from "./routes/codeRoutes";

// Any user can access to this route
app.use(router);
// This route require authenticated user
app.use("/user", passport.authenticate("jwt"), userRouter);
app.use("/classroom", passport.authenticate("jwt"), classroomRouter);
app.use("/classroom/exercise", passport.authenticate("jwt"), exerciseRouter);
app.use("/code", passport.authenticate("jwt"), codeRouter);

// app.use(adminBro.options.rootPath, adminRouter);

// DB config
export const dbConnection = () => {
  mongoose.connect(DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  var db = mongoose.connection;
  db.once("open", () => {
    console.log(`Database is connecting ${DB_CONNECTION}`);
  });
};

const runServer = () => {
  dbConnection();
  // Listen
  app.listen(PORT, () => {
    console.log(`Server is running on server http://localhost:${PORT}`);
  });
};

runServer();

export default app;
