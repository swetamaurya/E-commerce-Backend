const Order = require('../models/Order'); // Your Order Mongoose model

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// Get orders by user ID
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching orders' 
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    console.log('Fetching order with ID:', orderId, 'for user:', userId);
    
    // Try to find by _id first, then by orderId
    let order = await Order.findOne({ _id: orderId, userId: userId });
    
    if (!order) {
      order = await Order.findOne({ orderId: orderId, userId: userId });
    }
    
    if (!order) {
      console.log('Order not found for ID:', orderId);
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    console.log('Order found:', order.orderId);
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching order' 
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;
    
    // Get cart data
    const Cart = require('../models/Cart');
    const cart = await Cart.findOne({ user: userId });
    
    console.log('Cart data found:', {
      itemsCount: cart?.items?.length || 0,
      total: cart?.total || 0,
      items: cart?.items || []
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty' 
      });
    }

    // Generate order ID first
    const orderCount = await Order.countDocuments();
    const orderId = `ORD-${String(orderCount + 1).padStart(6, '0')}`;

    // Prepare order data
    const orderData = {
      orderId: orderId,
      userId: userId,
      customerName: req.body.customerName || user.name,
      customerEmail: req.body.customerEmail || user.email,
      customerPhone: req.body.customerPhone || user.mobile || '',
      shippingAddress: req.body.shippingAddress || {},
      items: cart.items.map(item => ({
        productId: item.product || item.productId,
        productName: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount: cart.total,
      discountAmount: req.body.discountAmount || 0,
      shippingAmount: req.body.shippingAmount || 0,
      taxAmount: req.body.taxAmount || 0,
      status: 'Order Received',
      paymentStatus: req.body.paymentStatus || 'Pending',
      paymentMethod: req.body.paymentMethod || 'COD',
      notes: req.body.notes || '',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    };

    console.log('Creating order with data:', {
      orderId: orderData.orderId,
      itemsCount: orderData.items.length,
      totalAmount: orderData.totalAmount,
      items: orderData.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price
      }))
    });
    
    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log('Order created successfully:', {
      orderId: newOrder.orderId,
      itemsCount: newOrder.items.length,
      totalAmount: newOrder.totalAmount,
      items: newOrder.items
    });

    // Clear the cart after successful order creation
    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating order' 
    });
  }
};

// Update order by ID
exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

// Delete order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error deleting order' });
  }
};
