const {
  CreateEnquiry,
  UpdateEnquiryForm,
  DeleteEnquireForm,
  GetEnquiryDetails,
  UpdateStatusEnquiry,
} = require("../Controllers/EnquiryControllers");

const router = require("express").Router();

router.post("/create", CreateEnquiry);
router.get("/get", GetEnquiryDetails);
router.patch("/update/:id", UpdateEnquiryForm);
router.delete("/delete/:id", DeleteEnquireForm);
router.get("/update/status/:id/:status", UpdateStatusEnquiry);

module.exports = router;
