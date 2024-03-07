import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionDBinstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `MONGODB CONNECTED  !!  DB HOST :${connectionDBinstance.connection.host}`
    );
  } catch (error) {
    console.log("Error", error);
    process.exit(1);
  }
};

export default connectDB;
