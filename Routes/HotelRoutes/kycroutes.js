const router = require("express").Router();
const {
  RegisterKyc,
  deleteTheKycRequest,
  GetAllKycRequests,
  MakeActionKyc,
  DeleteALLKycReq,
  UpdateKyc,
} = require("../../Controllers/HotelControllers/kycControllers");

// create new kyc req
router.post("/request", RegisterKyc);
// Update the approved kyc
router.patch("/update", UpdateKyc);
// action on kyc requests
router.get("/verify", MakeActionKyc);
// get all the kyc requested , approved and failed data
router.get("/getall", GetAllKycRequests);
// delete the kyc request
router.get("/delete/:id", deleteTheKycRequest);

// delete all the kyc
router.delete("/deleteall", DeleteALLKycReq);

module.exports = router;
