import { WebSocketServer } from 'ws';

export default function createSocket(port: number): void {
  const wss = new WebSocketServer({ port });
  console.log(`Websocket opened on ws://localhost:${port}`);

  wss.on('connection', (ws) => {
    console.log(`Websocket connection`);

    ws.on('message', (data: string) => {
      const command = JSON.parse(data);
      console.log("Received command:", command);
      const response = {
        type: "response",
        data: "Received command: " + JSON.stringify(command),
        id: 0,
      };
      ws.send(JSON.stringify(response));
    });

    ws.on('close', () => {
      console.log(`Socket was closed`);
    });
  })

  wss.on('close', () => 'WebSocket server was closed');
}