import amqp from 'amqplib';

let rabbitMQConnPromise: Promise<amqp.ChannelModel> | null = null;

async function connectRabbitMQ(retries = 0) {
  if (rabbitMQConnPromise != null) return rabbitMQConnPromise;

  rabbitMQConnPromise = (async () => {
    try {
      const connection = await amqp.connect(`${process.env.RABBITMQ_URL}`);
      connection.on('close', () => {
        console.warn(
          'At createConsumerChan.ts >> ',
          'Consumer channel closed. Will re-initialize on next access.'
        );
        rabbitMQConnPromise = null;
      });
      connection.on('error', (err) => {
        console.error(
          'At createConsumerChan.ts >> ',
          'Consumer rpc channel error:',
          err
        );
        rabbitMQConnPromise = null;
      });
      console.log('Connected to rabbitmq ✔✔✔');

      return connection;
    } catch (error) {
      console.error(
        'Failed to connect to RabbitMQ:',
        retries < 5
          ? 'Retrying in 60 seconds!'
          : 'Max retries have been reached! ✘✘✘'
      );
      if (retries >= 5) {
        rabbitMQConnPromise = null;
        throw new Error(
          'Failed to connect to RabbitMQ after multiple attempts!'
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 60000));
      rabbitMQConnPromise = null;
      connectRabbitMQ(retries + 1);
      throw error;
    }
  })();

  return rabbitMQConnPromise;
}

export default connectRabbitMQ;
