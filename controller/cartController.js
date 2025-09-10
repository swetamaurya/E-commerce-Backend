// controller/cartController.js
const Cart = require('../models/Cart');

/* ----------------------- helpers ----------------------- */
function asId(v) {
  return v ? String(v) : '';
}
function normQty(q) {
  const n = parseInt(q, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
function recomputeTotal(cart) {
  cart.total = cart.items.reduce((sum, it) => {
    const line = (Number(it.price) || 0) * (Number(it.quantity) || 0);
    return sum + line;
  }, 0);
}

/* ----------------------- controllers ----------------------- */

// GET /cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], total: 0 });
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching cart' });
  }
};

// POST /cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, price, title, image } = req.body;
    const userId = req.user.id;

    if (!productId || price == null || !title) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, price, and title are required',
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], total: 0 });
    }

    const pid = asId(productId);
    const qty = normQty(quantity);

    const idx = cart.items.findIndex((it) => asId(it.product) === pid);

    if (idx > -1) {
      // increment existing
      cart.items[idx].quantity = normQty((cart.items[idx].quantity || 0) + qty);
      // optionally update price/title/image if you want the latest snapshot
      if (price != null) cart.items[idx].price = Number(price) || 0;
      if (title) cart.items[idx].title = title;
      if (image) cart.items[idx].image = image;
    } else {
      // add new
      cart.items.push({
        product: productId,
        quantity: qty,
        price: Number(price) || 0,
        title,
        image,
      });
    }

    recomputeTotal(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Server error while adding to cart' });
  }
};

// DELETE /cart/remove/:productId
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    if (!cart.items || !cart.items.length) {
      return res.status(404).json({ success: false, message: 'Cart is empty' });
    }

    // Normalize IDs to strings for comparison
    const normalizeId = (id) => {
      if (id && id.toString) return id.toString();
      return id;
    };

    const beforeCount = cart.items.length;
    cart.items = cart.items.filter(item => {
      const prodId = normalizeId(item.product || item.productId || null);
      return prodId !== normalizeId(productId);
    });

    if (cart.items.length === beforeCount) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    // Assuming recomputeTotal recalculates cart.total based on items
    recomputeTotal(cart);

    await cart.save();

    res.status(200).json({ success: true, message: 'Item removed', data: cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Server error while removing from cart' });
  }
};


// PUT /cart/update/:productId  { quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    const qty = normQty(quantity);
    if (!qty) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const idx = cart.items.findIndex((it) => asId(it.product) === asId(productId));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[idx].quantity = qty;

    recomputeTotal(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: 'Server error while updating cart item' });
  }
};

// DELETE /cart/clear
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Server error while clearing cart' });
  }
};
