import { createServer } from 'http';
import { parse } from 'url';

const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url!, true);

  if (parsedUrl.pathname === '/ping') {
    res.statusCode = 200;
    res.write('pong');
    res.end();
  } else {
    res.statusCode = 501;
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`> server up on port: ${PORT}`);
});
