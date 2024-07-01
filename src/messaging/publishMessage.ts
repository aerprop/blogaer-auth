import amqp from 'amqplib';

export default async function publishMessage(
  channel: amqp.Channel,
  exchangeName: string,
  routingKey: string,
  message: Buffer
): Promise<void> {
  try {
    await channel.assertExchange(exchangeName, 'topic', {
      durable: false
    });
    channel.publish(exchangeName, routingKey, Buffer.from(message), {
      persistent: false
    });
    await channel.close();

    return Promise.resolve();
  } catch (error) {
    console.error('Error sending message to queue:', error);
    return Promise.reject(error);
  }
}
