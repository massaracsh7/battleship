import { httpServer } from './src/http_server/index';
import GameSocket from './src/ws/websocket';

const HTTP_PORT = 8181;
const SOCKET_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

new GameSocket(SOCKET_PORT);
