import { ConsoleMessage } from "../types/types";
import { WebSocket } from "ws";

export function logResponse(data: string): void {
  console.log(`Result: ${data}`);
}

export function logRequest(command: ConsoleMessage, socket: WebSocket): boolean {
  if (!command.hasOwnProperty('type')) {
    console.log('Wrong data from socket');
    const errMsg: ConsoleMessage = {
      type: 'error',
      data: "",
      id: -1
    };
    socket.send(JSON.stringify(errMsg));
    return false;
  }
  console.log(`Command: ${JSON.stringify(command.type)}`);
  return true;
}