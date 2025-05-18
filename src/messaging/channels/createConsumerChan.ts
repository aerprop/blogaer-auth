import amqp from 'amqplib';
import connectRabbitMQ from '../connection/connectRabbitMQ';
import { ExchangeName, ExchangeType } from '../../utils/enums';

let consumerChan: amqp.Channel | null = null;

async function createConsumerChan() {
  if (consumerChan != null) return consumerChan;
  try {
    const connection = await connectRabbitMQ;
    consumerChan = await connection.createChannel();
    await consumerChan.assertExchange(ExchangeName.Rpc, ExchangeType.Direct, {
      durable: false,
      autoDelete: true
    });
    await consumerChan.assertExchange(ExchangeName.Topic, ExchangeType.Topic, {
      durable: false,
      autoDelete: true
    });

    return consumerChan;
  } catch (error) {
    console.error(
      'At consumerChannel.ts >> ',
      error instanceof Error ? error.message : 'Creating channel failed'
    );

    return null;
  }
}

export default createConsumerChan();
