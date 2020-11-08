import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
// import helmet from "helmet";
import passport from "passport";

// // API server config
dotenv.config();
const SERVER = process.env.SERVER;
const PORT = process.env.PORT;
const DB_CONNECTION = process.env.MONGODB_PORT;
const ATLAS_URL = process.env.ATLAS_URL;
const app = express();
app.use(passport.initialize());

// // Middleware
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(morgan("tiny"));
// app.use(helmet());
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
