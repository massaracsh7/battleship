import { httpServer } from './src/http_server/index';
import createSocket from './src/ws/websocket';

const HTTP_PORT = 8181;
const SOCKET_PORT = 3000;

console.log(`Start http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

createSocket(SOCKET_PORT);

