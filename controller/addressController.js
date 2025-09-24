const Address = require('../models/Address');

// Get all addresses for a user
exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching addresses'
    });
  }
};

// Get default address for a user
exports.getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await Address.findOne({ userId, isDefault: true });
    
    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching default address'
    });
  }
};

// Create new address
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, addressLine1, addressLine2, city, state, pincode, phone, addressType, isDefault } = req.body;

    // Validate required fields
    if (!fullName || !addressLine1 || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    const addressData = {
      userId,
      fullName,
      addressLine1,
      addressLine2: addressLine2 || '',
      city,
      state,
      pincode,
      phone,
      addressType: addressType || 'Home',
      isDefault: isDefault || false
    };

    const address = new Address(addressData);
    await address.save();

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: address
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating address'
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const address = await Address.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating address'
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const address = await Address.findOneAndDelete({ _id: id, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting address'
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First, set all addresses to not default
    await Address.updateMany({ userId }, { isDefault: false });

    // Then set the selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: id, userId },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting default address'
    });
  }
};
