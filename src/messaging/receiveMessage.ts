import amqp from 'amqplib';

export default async function receiveMessage(
  connection: amqp.Connection,
  exchangeName: string,
  queueName: string,
  routingKey: string
): Promise<string | null> {
  try {
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'direct', {
      durable: false
    });
    const { queue } = await channel.assertQueue(queueName, {
      exclusive: false,
      durable: false
    });
    await channel.bindQueue(queue, exchangeName, routingKey);

    return new Promise((resolve) => {
      channel.consume(queue, (msg) => {
        if (msg) resolve(msg.content.toString());
        else resolve(null);
      });
    });
  } catch (error) {
    console.error('Error receiving message to queue:', error);
    return Promise.reject(error);
  }
}
