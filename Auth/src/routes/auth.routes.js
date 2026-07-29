import { Router } from "express";
import User from "../models/users.model.js";
import jwt from "jsonwebtoken";
import passport from "passport"

const authRouter = Router();

// Router.get("/auth/register", (req, res) => {
//     res.status(200).json({
//         message: "User registered successfully",
//         status: "success",
//     });
// })

// authRouter.get("/auth/login", (req, res) => {
//     res.status(200).json({
//         message: "User logged in successfully",
//         status: "success",
//     });
// })

authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    try {

        const { id, displayName, emails, photos } = req.user
        const user = await User.findOne({ googleId: id })

        if (!user) {
            const newUser = new User({
                googleId: id,
                name: displayName,
                email: emails[0].value,
                avatar: photos[0].value,
            })
            await newUser.save()
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie("token", token, {
            httpOnly: true,
        });

        res.redirect('/');
    } catch (error) {
        res.status(500).json({ message: "Failed to register user", status: "error" });
        res.redirect('/');
    }
});

export default authRouter;