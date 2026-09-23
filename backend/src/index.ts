import "dotenv/config";
import "reflect-metadata";
import { createServer } from "http";
import app from "./app";
import mongoose from "mongoose";

const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) throw new Error("DB_PASSWORD non configurata nel file .env");

mongoose.set("debug", true);
mongoose
  .connect(
    `mongodb+srv://gianlucarigoni_db_user:${encodeURIComponent(dbPassword)}` +
      `@bankinappdb.wiep7c5.mongodb.net/bankingApp`,
  )
  .then((_) => {
    console.log("MongoDB connected");
    createServer(app).listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  })
  .catch((err) => {
    console.error(err);
  });
