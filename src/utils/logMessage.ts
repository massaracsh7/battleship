import { ConsoleMessage } from "../types/types";
import { WebSocket } from "ws";

export function logRequest(msg: ConsoleMessage, socket: WebSocket): boolean {
  if (!('type' in msg)) {
    console.log('Wrong data from socket!');
    const resErr: ConsoleMessage = {
      type: 'error',
      data: "",
      id: -1
    };
    socket.send(JSON.stringify(resErr));
    return false;
  }
  console.log(`Get from player: ${JSON.stringify(msg)}`);
  return true;
}

export function logResponse(data: string): void {
  console.log(`Response to player${data}`);
}
