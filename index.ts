import { httpServer } from './src/http_server/index';
import createSocket from './src/ws/websocket';

const HTTP_PORT = 8181;
const SOCKET_PORT = 3000;

console.log(`\n\x1B[38;2;217;37;210mStart static http server on the ${HTTP_PORT} port!\x1B[0m`);
httpServer.listen(HTTP_PORT);

createSocket(SOCKET_PORT);