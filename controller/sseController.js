const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Store active SSE connections
const connections = new Map();

// SSE endpoint for order status updates
exports.orderStatusSSE = (req, res) => {
  console.log('SSE request received:', req.query);
  
  // Handle token authentication for SSE
  const token = req.query.token;
  if (!token) {
    console.log('No token provided for SSE');
    res.writeHead(401, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    res.write(`data: ${JSON.stringify({ success: false, message: 'Unauthorized' })}\n\n`);
    res.end();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    const userId = decoded.id;
    console.log('SSE authenticated for user:', userId);
  
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to order updates' })}\n\n`);

    // Store connection
    const connectionId = `${userId}_${Date.now()}`;
    connections.set(connectionId, { res, userId });

    // Send initial order data
    const sendInitialData = async () => {
      try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.write(`data: ${JSON.stringify({ 
          type: 'initial_data', 
          orders: orders 
        })}\n\n`);
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };

    sendInitialData();

    // Handle client disconnect
    req.on('close', () => {
      console.log(`SSE connection closed for user ${userId}`);
      connections.delete(connectionId);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });

  } catch (error) {
    console.error('SSE authentication error:', error);
    res.writeHead(401, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    res.write(`data: ${JSON.stringify({ success: false, message: 'Invalid token' })}\n\n`);
    res.end();
  }
};

// Broadcast order status update to specific user
exports.broadcastOrderUpdate = (userId, orderId, newStatus, orderData) => {
  const message = {
    type: 'order_update',
    orderId,
    newStatus,
    orderData,
    timestamp: new Date().toISOString()
  };

  // Find all connections for this user
  for (const [connectionId, connection] of connections) {
    if (connection.userId === userId) {
      try {
        connection.res.write(`data: ${JSON.stringify(message)}\n\n`);
        console.log(`Order update sent to user ${userId} for order ${orderId}: ${newStatus}`);
      } catch (error) {
        console.error('Error sending update to user:', error);
        connections.delete(connectionId);
      }
    }
  }
};

// Broadcast to all admin connections
exports.broadcastToAdmins = (message) => {
  for (const [connectionId, connection] of connections) {
    if (connection.userId && connection.isAdmin) {
      try {
        connection.res.write(`data: ${JSON.stringify(message)}\n\n`);
      } catch (error) {
        console.error('Error sending update to admin:', error);
        connections.delete(connectionId);
      }
    }
  }
};

// Get active connections count
exports.getConnectionsCount = () => {
  return connections.size;
};
