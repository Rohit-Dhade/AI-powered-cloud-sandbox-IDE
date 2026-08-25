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
        prompt: "select_account",
    })
);

authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login",
    }),
    async (req, res) => {
        try {
            const googleId = req.user?.googleId || req.user?.id;
            const displayName = req.user?.name || req.user?.displayName || "User";
            const email = req.user?.email || req.user?.emails?.[0]?.value;
            const avatar = req.user?.avatar || req.user?.photos?.[0]?.value;

            if (!email) {
                return res.status(400).json({
                    message: "Google account does not provide an email",
                    status: "error",
                });
            }

            let user = await User.findOne({
                googleId: googleId,
            });

            if (!user) {
                user = new User({
                    googleId: googleId,
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

authRouter.get("/me", async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ authenticated: false, user: null, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ authenticated: false, user: null, message: "User not found" });
        }

        return res.status(200).json({
            authenticated: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            }
        });
    } catch (error) {
        return res.status(401).json({ authenticated: false, user: null, message: "Invalid token" });
    }
});

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
    });
    return res.status(200).json({ message: "Logged out successfully" });
});

export default authRouter;