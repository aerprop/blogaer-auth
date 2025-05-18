import amqp from 'amqplib';

let rabbitMQConn: amqp.ChannelModel | null = null;

async function connectRabbitMQ(retries = 0) {
  if (rabbitMQConn != null) return rabbitMQConn;
  try {
    rabbitMQConn = await amqp.connect(`${process.env.RABBITMQ_URL}`);
    console.log('Connected to rabbitmq ✔✔✔');
    return rabbitMQConn;
  } catch (error) {
    console.log(
      'Failed to connect to RabbitMQ:',
      retries < 5 ? 'Retrying in 60 seconds.' : 'Max retries have been reached.'
    );
    if (retries >= 5) {
      throw new Error('Failed to connect to RabbitMQ after multiple attempts');
    }
    await new Promise((resolve) => setTimeout(resolve, 60000));

    return connectRabbitMQ(retries + 1);
  }
}

export default connectRabbitMQ();
