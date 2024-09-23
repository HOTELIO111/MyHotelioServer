const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
} = require("../Controllers/coupons");

const router = require("express").Router();

router.post("/create", createCoupon);
router.get("/getall", getAllCoupons);
router.get("/byid/:id", getCouponById);
router.patch("/update/:id", updateCouponById);
router.delete("/delete/:id", deleteCouponById);

module.exports = router;
