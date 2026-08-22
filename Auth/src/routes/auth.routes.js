import { Router } from "express";
import User from "../models/users.model.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import { sendAuthNotification } from "../config/mq.js";

const authRouter = Router();

authRouter.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
    }),
    async (req, res) => {
        try {
            const { id, displayName, emails, photos } = req.user;

            const email = emails?.[0]?.value;
            const avatar = photos?.[0]?.value;

            if (!email) {
                return res.status(400).json({
                    message: "Google account does not provide an email",
                    status: "error",
                });
            }

            let user = await User.findOne({
                googleId: id,
            });

            if (!user) {
                user = new User({
                    googleId: id,
                    name: displayName,
                    email: email,
                    avatar: avatar,
                });

                await user.save();
            }

            await sendAuthNotification({
                email: email,
                userId: user._id,
                timestamp: new Date(),
                action: "google_login",
            });

            const token = jwt.sign(
                {
                    id: user._id,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "4h",
                }
            );

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
            });

            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            res.redirect(frontendUrl);

        } catch (error) {
            console.error("Google authentication error:", error);

            return res.status(500).json({
                message: "Failed to authenticate user",
                status: "error",
            });
        }
    }
);

export default authRouter;