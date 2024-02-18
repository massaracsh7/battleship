import { httpServer } from './src/http_server/index';
import createSocket from './src/ws/websocket';

const HTTP_PORT = 8181;
const SOCKET_PORT = 3000;

console.log(`Start static http server on port ${HTTP_PORT}!`);
httpServer.listen(HTTP_PORT);

createSocket(SOCKET_PORT);
console.log(`Websocket server started on ws://localhost:${SOCKET_PORT}`);

