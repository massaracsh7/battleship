
import { WebSocket } from "ws";

export function responseRes(data: string): void {
  console.log('Send command to client:');
  console.log(`Response to client ${data}`);
}

export function requestRes(command, socket: WebSocket): boolean {
  if (!command.hasOwnProperty('type')) {
    console.log('Error from socket');
    const resErr = {
      type: 'error',
      data: "",
      id: -1
    };
    socket.send(JSON.stringify(resErr));
    return false;
  }

  console.log('Get command from client:');
  console.log(`Get from client: ${JSON.stringify(command)}`);

  return true;
}
