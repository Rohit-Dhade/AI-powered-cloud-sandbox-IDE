import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import sendEmail from "./email.js";
import channel from "./mq.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Notification service is running");
});

app.get("/_status/readyz", (req, res) => {
    res.send("OK");
});

app.get("/_status/healthz", (req, res) => {
    res.send("OK");
});

channel.consume("auth_notification_queue", async (msg) => {
    const messageContent = msg.content.toString();
    console.log("Message content: ", messageContent);
    if (msg !== null) {
        try {
            const { userId, timestamp, email } = JSON.parse(messageContent);
            const subject = 'New Login Notification'
            const text = `A new login has been detected on your account at ${timestamp}.
            If this was not you, please change your password immediately.
            `
            const html = `
            <p>A new login has been detected on your account at ${timestamp}.</p>
            <p>If this was not you, please change your password immediately.</p>
            `
            await sendEmail(email, subject, text, html);
            channel.ack(msg);
        } catch (error) {
            console.error("Error sending email: ", error);
            channel.nack(msg);
        }
    } else {
        console.log("No message received from queue");
    }
});

export default app; 