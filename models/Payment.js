const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, unique: true, required: true },
  orderId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { 
    type: String, 
    enum: ['Credit_card', 'Debit_card', 'UPI', 'Net_banking', 'Wallet', 'COD'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Success', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Pending' 
  },
  transactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  refundAmount: { type: Number, default: 0 },
  refundReason: String,
  refundedAt: Date
}, { timestamps: true });

// Generate payment ID before saving
paymentSchema.pre('save', async function(next) {
  if (!this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
