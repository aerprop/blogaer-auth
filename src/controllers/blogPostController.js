import http from 'http';

const blogPostController = (req, res) => {
  const role = req.role;
  console.log('two: ', role);

  if (role.toLowerCase() === 'author') {
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

    console.log('two: ', proxy);

    proxy.on('error', (error) => {
      console.error('Proxy Error:', error);
      res.status(500).send('Proxy Error');
    });
  } else {
    res.status(403).send('Forbidden');
  }
};

export default blogPostController;
