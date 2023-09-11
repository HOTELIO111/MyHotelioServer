const router = require('express').Router();
const { RegisterKyc, deleteTheKycRequest } = require('../../Controllers/HotelControllers/kycControllers')


// create new kyc req 
router.post("/request", RegisterKyc);
router.get("/verify",)
router.get("/delete/:id", deleteTheKycRequest)










module.exports = router