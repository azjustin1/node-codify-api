import express from "express";
import socket from "socket.io";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import passport from "passport";

// Models
import User from "./models/User";

// API server config
dotenv.config();
const SERVER = process.env.SERVER;
const PORT = process.env.PORT;
const DB_CONNECTION = process.env.MONGODB_PORT;
const ATLAS_URL = process.env.ATLAS_URL;
const app = express();
// const server = http.createServer(app)
// export const io = socket(server)

// DB config
mongoose.connect(DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

mongoose.connection.once("open", () => {
  console.log("Database connected");
});

// Middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(morgan("combined"));
app.use(helmet());

// // Web Socket
// io.on('connection', (socket) => {
//     console.log('This is websocket')
// })

// Routes
import routes from "./routes/routes";
import secureRoutes from "./routes/secureRoutes";

app.use(routes);
// This route require authenticate
app.use(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  secureRoutes
);

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on server http://localhost:${PORT}`);
});
