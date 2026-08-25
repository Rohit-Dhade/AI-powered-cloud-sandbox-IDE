import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import mongoose from "mongoose";
import authRouter from "./routes/auth.routes.js";
import User from "./models/users.model.js";

const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,       // Must be false for HTTP (localhost)
            sameSite: "lax",     // Allows the cookie to survive Google's cross-site redirect
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        let user = null;
        if (id && mongoose.Types.ObjectId.isValid(id)) {
            user = await User.findById(id);
        }
        if (!user && id) {
            user = await User.findOne({ googleId: String(id) });
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});


app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["profile", "email"],   // ← must be here, not just in the route
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

app.get("/_status/healthz", (req, res) => {
    res.status(200).json({
        message: "Auth service is healthy",
        status: "success",
    });
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).json({
        message: "Auth service is ready",
        status: "success",
    });
});

app.use("/api/auth", authRouter);

export default app;
