import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 8080 });

const connectToBackend = (frontendWs, sessionId) => {
  const backendWs = new WebSocket(`ws://localhost:3045/hr/${sessionId}`);

  backendWs.on('message', (data) => {
    try {
      const message = data.toString();
      const backendResponse = JSON.parse(message);
      frontendWs.send(JSON.stringify(backendResponse));
    } catch (error) {
      console.error('Error parsing backend message:', error.message);
    }
  });

  backendWs.on('error', (error) => {
    console.error('Backend WebSocket error:', error);
    frontendWs.send(JSON.stringify({
      text: `Error connecting to backend: ${error.message}`
    }));
  });

  backendWs.on('close', (code, reason) => {
    console.error(`Disconnected from Python backend. Code: ${code}, Reason: ${reason.toString()}`);
    setTimeout(() => connectToBackend(frontendWs, sessionId), 3000);
  });

  return backendWs;
};

wss.on('connection', (frontendWs) => {
  const sessionId = uuidv4();
  const backendWs = connectToBackend(frontendWs, sessionId);

  frontendWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.text && backendWs.readyState === WebSocket.OPEN) {
        backendWs.send(JSON.stringify({ text: message.text }));
      } else {
        console.error('Backend WebSocket not open');
        frontendWs.send(JSON.stringify({
          text: 'Failed to send message. Backend is disconnected.'
        }));
      }
    } catch (error) {
      console.error('Error parsing frontend message:', error);
      frontendWs.send(JSON.stringify({
        text: 'Error processing your message. Please try again.'
      }));
    }
  });

  frontendWs.on('close', () => {
    console.error('Frontend client disconnected');
    backendWs.close();
  });

  frontendWs.on('error', (error) => {
    console.error('Frontend WebSocket error:', error);
  });
});

console.log('WebSocket server running at ws://localhost:8080');