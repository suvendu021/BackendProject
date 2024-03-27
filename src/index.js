// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";

import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "../.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("express can not interact with DB", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log("server is running at port ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.error("MONGODB connection failed", err);
  });
