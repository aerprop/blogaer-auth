import amqp from 'amqplib';

async function rabbitConnect(retries = 0) {
  try {
    const connection = await amqp.connect(`${process.env.RABBITMQ_URL}`);
    console.log('Connected to rabbitmq ✔✔✔');
    return connection;
  } catch (error) {
    console.log(
      'Failed to connect to RabbitMQ:',
      retries < 5
        ? 'Retrying in 60 seconds.'
        : 'Max retries have been reached.'
    );
    if (retries >= 5) {
      throw new Error('Failed to connect to RabbitMQ after multiple attempts');
    }
    await new Promise((resolve) => setTimeout(resolve, 60000));

    return rabbitConnect(retries + 1);
  }
}

async function init() {
  return await rabbitConnect();
}

export default init();
