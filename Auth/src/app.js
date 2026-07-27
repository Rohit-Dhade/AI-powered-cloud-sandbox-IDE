import "dotenv/config"
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import authRouter from "./routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());

app.get('/_status/healthz', (req, res) => {
    res.status(200).json({
        message: "Auth service is healthy",
        status: "success",
    });
})


app.get('/_status/readyz', (req, res) => {
    res.status(200).json({
        message: "Auth service is ready",
        status: "success",
    });
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ["profile", "email"],
    state: true,
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.use("/api/auth", authRouter);

export default app;  