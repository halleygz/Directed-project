//express
import express from "express";
import expresslayout from "express-ejs-layouts";
//method
import methodOverride from 'method-override';
//cookie and session
import cookieParser from "cookie-parser";
import session from 'express-session';
//mongodb
import MongoStore from "connect-mongo";
import connectDB from "./server/config/db.js";
//dotenv
import dotenv from "dotenv";

//routes
import userRoutes from "./server/routes/user.routes.js"
import authRoutes from "./server/routes/auth.routes.js"
import homeRoutes from "./server/routes/home.routes.js"

//configs
dotenv.config();
const app = express();
const PORT = 3000 || process.env.PORT;
connectDB();

//methodoverride and cookies
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
//routes
app.use("/", homeRoutes)
app.use("/", authRoutes)
app.use("/", userRoutes)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
