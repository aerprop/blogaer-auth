import amqp from 'amqplib';
import connectRabbitMQ from '../connection/connectRabbitMQ';
import { ExchangeName, ExchangeType } from '../../utils/enums';

let publisherChan: amqp.Channel | null = null;

async function createPublisherChan() {
  if (publisherChan != null) return publisherChan;
  try {
    const connection = await connectRabbitMQ;
    publisherChan = await connection.createChannel();
    await publisherChan.assertExchange(ExchangeName.Rpc, ExchangeType.Direct, {
      durable: false,
      autoDelete: true
    });
    await publisherChan.assertExchange(ExchangeName.Topic, ExchangeType.Topic, {
      durable: false,
      autoDelete: true
    });

    return publisherChan;
  } catch (error) {
    console.error(
      'At publisherChannel.ts >> ',
      error instanceof Error ? error.message : 'Creating channel failed'
    );

    return null;
  }
}

export default createPublisherChan();
