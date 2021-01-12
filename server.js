import express from "express";
import bodyParser from "body-parser";
import socketIO from "./middleware/socketIO";
import ejs from "ejs";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";
import adminRouter, { adminBro } from "./config/admin";
import mongoDbConnection from "./config/mongodbConfigs";

// // API server config
dotenv.config();
const SERVER = process.env.SERVER;
const PORT = process.env.PORT || 9000;
const ROBO3T = process.env.ROBO3T;
const ATLAS_URL = process.env.ATLAS_URL;
const DB_CONNECTION = ROBO3T;

const app = express();
app.use(session({ secret: process.env.SECRET_STRING }));
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan("tiny"));
app.set("views", __dirname + "/public");
app.engine("html", ejs.renderFile);

// Routes

import router from "./routes/routes";
import userRouter from "./routes/userRoutes";
import classroomRouter from "./routes/classroomRoutes";
import exerciseRouter from "./routes/exerciseRoutes";
import resultRouter from "./routes/resultRoutes";
import codeRouter from "./routes/codeRoutes";

app.use("/admin", adminRouter);

// Any user can access to this route
app.use(router);
// This route require authenticated user
app.use("/users", passport.authenticate("jwt"), userRouter);
app.use("/classrooms", passport.authenticate("jwt"), classroomRouter);
app.use(
  "/classrooms/:alias/exercises",
  passport.authenticate("jwt"),
  exerciseRouter
);
app.use("/classrooms/:alias/exercises/:id/results", resultRouter);

app.use("/code", passport.authenticate("jwt"), codeRouter);

const runServer = async () => {
  mongoDbConnection(DB_CONNECTION);
  // Listen
  const server = await app.listen(PORT, () => {
    console.log(`Server is running on server http://localhost:${PORT}`);
  });
  socketIO(server);
};

runServer();

export default app;
