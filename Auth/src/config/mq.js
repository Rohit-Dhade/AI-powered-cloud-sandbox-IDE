import amqp from "amqplib";

const QUEUE = 'auth_notification_queue';

let channel = null;

async function getChannel() {
    if (channel) return channel;

    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(QUEUE, { durable: true });

        connection.on('close', () => {
            console.error('RabbitMQ connection closed');
            channel = null;
        });

        connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err.message);
            channel = null;
        });

        console.log('RabbitMQ connected, queue asserted:', QUEUE);
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error.message);
        channel = null;
        return null;
    }
}

export async function sendAuthNotification(message) {
    const ch = await getChannel();
    if (!ch) {
        console.error('RabbitMQ channel not available, skipping notification:', message);
        return;
    }

    ch.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(message)),
        {
            persistent: true
        }
    );
    console.log('Auth notification sent to queue:', message.action);
}