import amqp from 'amqplib';
import connectRabbitMQ from '../connection/connectRabbitMQ';
import { ExchangeName, ExchangeType } from '../../utils/enums';

let pubChanRpcPromise: Promise<amqp.Channel> | null = null;

async function createConsumerChan(): Promise<amqp.Channel> {
  if (pubChanRpcPromise != null) return pubChanRpcPromise;

  pubChanRpcPromise = (async () => {
    try {
      const connection = await connectRabbitMQ;
      const channel = await connection.createChannel();
      await channel.assertExchange(ExchangeName.Rpc, ExchangeType.Direct, {
        durable: false,
        autoDelete: true
      });
      channel.on('close', () => {
        console.warn(
          'Consumer rpc channel closed. Will re-initialize on next access.'
        );
        pubChanRpcPromise = null;
      });
      channel.on('error', (err) => {
        console.error('Consumer rpc channel error:', err);
        pubChanRpcPromise = null;
      });

      return channel;
    } catch (error) {
      console.error(
        'At createConsumerChan.ts >> ',
        error instanceof Error ? error.message : 'Creating channel failed!'
      );
      pubChanRpcPromise = null;

      throw error;
    }
  })();

  return pubChanRpcPromise;
}

export default createConsumerChan;
