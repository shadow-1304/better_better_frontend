import { WebSocketServer } from 'ws';

// Mock AI responses based on user input
const mockAIResponses = {
  "hello": "Hi there! How can I assist you with paper manufacturing today?",
  "paper manufacturing": "Modern paper manufacturing involves processes like pulping, refining, and pressing. Want details on any specific step?",
  "production optimization": "To optimize your paper production line, focus on automation, real-time monitoring, and reducing waste. Need specific tips?",
  "quality control": "Best practices for paper quality control include regular testing for tensile strength, thickness, and moisture content. Want more details?",
  "troubleshooting": "Common papermaking issues include paper jams, uneven coating, or machine downtime. Describe your issue for specific advice!"
};

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received:', message.text);
      
      // Generate AI response based on user input
      const userMessage = message.text.toLowerCase();
      let aiResponse = mockAIResponses[userMessage] || "I'm not sure about that, but I can help with paper manufacturing queries! Try asking about production or quality control.";
      
      ws.send(JSON.stringify({ text: aiResponse }));
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ text: "Error processing your message. Please try again." }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running at ws://localhost:8080');