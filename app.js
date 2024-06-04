import express from "express";
import mongoose from "mongoose";
import expresslayout from "express-ejs-layouts";
import methodOverride from 'method-override';
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from 'express-session';
import connectDB from "./server/config/db.js";
import main from './server/routes/main.js'
import admin from './server/routes/admin.js'
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 5000 || process.env.PORT;

connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'))
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
}));
app.use(express.static("public"));

//template enginies
app.use(expresslayout);
app.set("view engine", "ejs");
app.set("layout", "./layouts/main");

app.use("/", main);
app.use("/", admin);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
