import amqp from 'amqplib';

let connection: amqp.Connection | null = null;

async function connectToRabbitMQ() {
  if (!connection)
    connection = await amqp.connect('amqp://anekra:1234@localhost:5672');
  return connection;
}

export async function publishMessage(exchangeName: string, message: string) {
  const conn = await connectToRabbitMQ();
  const channel = await conn.createChannel();
  await channel.assertExchange(exchangeName, 'fanout', { durable: false });
  channel.sendToQueue(exchangeName, Buffer.from(message), {
    persistent: false
  });
  await channel.close();
}
