import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
}, { timestamps: true })

const User = mongoose.model("users", usersSchema);
export default User;