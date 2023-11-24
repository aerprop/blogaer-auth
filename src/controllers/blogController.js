import http from 'http';
import { channel } from '../config/rabbitMQConfig';

const blogController = {
  /** @param {Response} res */
  async insert(req, res) {
    if (channel !== null) {
      try {
        channel.assertQueue('blog_post');
        channel.sendToQueue('blog_post', Buffer.from('test blog post!!!'));
        console.log(res.body);
      } catch (err) {
        console.log('blogPost: ', err);
      }
    } else {
      const options = {
        hostname: process.env.DEV_HOST,
        port: 3032,
        path: req.url,
        method: req.method,
        headers: req.headers
      };

      const proxy = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });

      req.pipe(proxy, { end: true });

      proxy.on('error', (error) => {
        console.error('Proxy Error:', error);
        res.status(500).send('Proxy Error');
      });
    }
  }
};

export default blogController;
