import rabbitConn from '../../messaging/connection/rabbitMQConn';
import { Options } from 'amqplib';

export default async function rabbitMQService(
  exchangeName: string,
  type: string,
  options?: Options.AssertExchange
) {
  try {
    const connection = await rabbitConn;
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, type, options);

    return { connection, channel };
  } catch (error) {
    const errMsg = `Creating channel failed: ${exchangeName} ✘✘✘`;
    console.error(errMsg, error);

    return errMsg;
  }
}
