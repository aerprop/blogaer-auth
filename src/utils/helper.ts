import { UAParser } from 'ua-parser-js';
import initMainModel from '../models/initMainModel';
import { UserAgent } from '../types/common';
import { Channel } from 'amqplib';

export async function getAllUserImgsAndUsernames() {
  const model = await initMainModel;
  if (!model) return;
  return await model.user.findAll({
    attributes: ['id', 'username', 'picture']
  });
}

export async function getUserById(userId: string) {
  const model = await initMainModel;
  if (!model) return;
  return model.user.findByPk(userId, {
    attributes: ['username', 'picture']
  });
}

export function generateRandomChars(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export async function getMainModel() {
  return await initMainModel;
}

export function generateClientId(userAgent: string = '') {
  if (!userAgent) return { clientId: null, userAgent: null };
  const uaParsed = new UAParser(userAgent);
  const client = uaParsed.getResult();
  const data = {
    browser: client.browser.name,
    cpu: client.cpu.architecture,
    platform: client.device.type || 'desktop',
    vendor: client.device.vendor,
    engine: client.engine.name,
    os: `${client.os.name} v-${client.os.version}`
  };
  const stringData = JSON.stringify(data);
  const secret = process.env.USER_AGENT_SECRET;
  const divider = process.env.USER_AGENT_DIVIDER;
  const clientId = Buffer.from(`${secret}${divider}${stringData}`).toString(
    'base64'
  );

  return { clientId, userAgent: data };
}

export function getUserAgentData(clientId: string) {
  const decoded = Buffer.from(clientId, 'base64').toString();
  const divider = process.env.USER_AGENT_DIVIDER;
  const [secret, value] = decoded.split(`${divider}`);
  const SECRET = process.env.USER_AGENT_SECRET;

  if (secret !== SECRET) {
    return null;
  }

  return JSON.parse(value) as UserAgent;
}

export function generateOtp() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10);
    result += digit;
  }
  return result;
}

export async function closeChannel(timeout: NodeJS.Timeout, channel: Channel) {
  try {
    clearTimeout(timeout);
    await channel.close();
  } catch (error) {
    console.warn('At handleGetPostById >>', 'Channel already closed!');
  }
}
