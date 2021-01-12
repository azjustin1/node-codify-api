import mongoose from "mongoose";
// DB config

export let mongoDb;
const mongoDbConnection = async (dbUrl) => {
  mongoDb = await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  });

  const db = mongoose.connection;
  db.once("open", () => {
    console.log(`Database is connecting ${dbUrl}`);
  });
};

export default mongoDbConnection;
