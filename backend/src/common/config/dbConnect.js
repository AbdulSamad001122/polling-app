import mongoose from "mongoose";

async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  await mongoose.connect(uri).catch((error) => {
    console.log("Error connecting to database", error);
  });

  console.log("Database connected successfully");
  return mongoose.connection;
}

export default connectDb;
