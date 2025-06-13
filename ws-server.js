import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid'; // For generating session_id

// Create WebSocket server for frontend clients
const wss = new WebSocketServer({ port: 8080 });

// Function to connect to Python backend WebSocket
const connectToBackend = (frontendWs, sessionId) => {
  const backendWs = new WebSocket(`ws://localhost:3045/hr/${sessionId}`);

  backendWs.on('open', () => {
    console.log(`Connected to Python backend at ws://localhost:3045/hr/${sessionId}`);
  });

  backendWs.on('message', (data) => {
    try {
      const backendResponse = JSON.parse(data.toString());
      console.log('Received from backend:', backendResponse);
      // Forward backend response to frontend client
      if (backendResponse.text) {
        frontendWs.send(JSON.stringify({ text: backendResponse.text }));
      }
    } catch (error) {
      console.error('Error parsing backend message:', error);
      frontendWs.send(JSON.stringify({ text: 'Error receiving response from backend.' }));
    }
  });

  backendWs.on('error', (error) => {
    console.error('Backend WebSocket error:', error);
    frontendWs.send(JSON.stringify({ text: `Error connecting to backend: ${error.message}` }));
  });

  backendWs.on('close', (code, reason) => {
    console.log(`Disconnected from Python backend. Code: ${code}, Reason: ${reason.toString()}`);
    // Attempt to reconnect after 3 seconds
    setTimeout(() => connectToBackend(frontendWs, sessionId), 3000);
  });

  return backendWs;
};

wss.on('connection', (frontendWs) => {
  console.log('Frontend client connected');

  // Generate a unique session_id for this connection
  const sessionId = uuidv4();
  console.log(`Generated session_id: ${sessionId}`);

  // Connect to Python backend with session_id
  const backendWs = connectToBackend(frontendWs, sessionId);

  frontendWs.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received from frontend:', message.text);
      
      // Forward message to Python backend
      if (message.text && backendWs.readyState === WebSocket.OPEN) {
        backendWs.send(JSON.stringify({ text: message.text }));
      } else {
        console.error('Backend WebSocket not open');
        frontendWs.send(JSON.stringify({ text: 'Failed to send message. Backend is disconnected.' }));
      }
    } catch (error) {
      console.error('Error parsing frontend message:', error);
      frontendWs.send(JSON.stringify({ text: 'Error processing your message. Please try again.' }));
    }
  });

  frontendWs.on('close', () => {
    console.log('Frontend client disconnected');
    // Close backend connection when frontend disconnects
    backendWs.close();
  });

  frontendWs.on('error', (error) => {
    console.error('Frontend WebSocket error:', error);
  });
});

console.log('WebSocket server running at ws://localhost:8080');