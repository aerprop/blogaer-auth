import amqp from 'amqplib';
import connectRabbitMQ from '../connection/connectRabbitMQ';
import { ExchangeName, ExchangeType } from '../../utils/enums';

let pubChanTopicPromise: Promise<amqp.Channel> | null = null;

async function createPubTopicChan(): Promise<amqp.Channel> {
  if (pubChanTopicPromise != null) return pubChanTopicPromise;

  pubChanTopicPromise = (async () => {
    try {
      const connection = await connectRabbitMQ();
      const channel = await connection.createChannel();
      await channel.assertExchange(ExchangeName.Topic, ExchangeType.Direct, {
        durable: false,
        autoDelete: true
      });
      channel.on('close', () => {
        console.warn(
          'Publisher channel closed. Will re-initialize on next access.'
        );
        pubChanTopicPromise = null;
      });
      channel.on('error', (err) => {
        console.error('Publisher Topic channel error:', err);
        pubChanTopicPromise = null;
      });

      return channel;
    } catch (error) {
      console.error(
        'At createPubTopicChan.ts >> ',
        error instanceof Error ? error.message : 'Creating channel failed!'
      );
      pubChanTopicPromise = null;

      throw error;
    }
  })();

  return pubChanTopicPromise;
}

export default createPubTopicChan;
