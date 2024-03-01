const CouponModel = require("../Model/couponModel");

// Create a new coupon
const createCoupon = async (req, res) => {
  const formData = req.body;
  try {
    const response = await new CouponModel(formData).save();
    res.status(200).json({
      error: false,
      message: "Coupon created successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await CouponModel.find();
    res.status(200).json({ error: false, message: "Success", data: coupons });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Get a single coupon by ID
const getCouponById = async (req, res) => {
  const { id } = req.params;
  try {
    const coupon = await CouponModel.findById(id);
    if (!coupon) {
      return res.status(404).json({ error: true, message: "Coupon not found" });
    }
    res.status(200).json({ error: false, message: "Success", data: coupon });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Update a coupon by ID
const updateCouponById = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  try {
    const updatedCoupon = await CouponModel.findByIdAndUpdate(id, formData, {
      new: true,
    });
    if (!updatedCoupon) {
      return res.status(404).json({ error: true, message: "Coupon not found" });
    }
    res.status(200).json({
      error: false,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// Delete a coupon by ID
const deleteCouponById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCoupon = await CouponModel.findByIdAndDelete(id);
    if (!deletedCoupon) {
      return res.status(404).json({ error: true, message: "Coupon not found" });
    }
    res.status(200).json({
      error: false,
      message: "Coupon deleted successfully",
      data: deletedCoupon,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
};
