import amqp from 'amqplib';

export let channel: amqp.Channel | null = null;

export async function rabbitMQConnection() {
  try {
    const connection = await amqp.connect('amqp://anekra:1234@localhost:5672');
    channel = await connection.createChannel();
    console.log('Connected to rabbitmq.');
  } catch (error) {
    console.error('Failed to connect to rabbitmq!');
    channel = null;
  }
}
