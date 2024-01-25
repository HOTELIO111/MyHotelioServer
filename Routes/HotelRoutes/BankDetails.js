const {
  AddPartnerBankDetials,
  UpdatePartnerBankDetails,
  DeletePartnerBankDetails,
} = require("../../Controllers/HotelControllers/BankDetailsControllers");

const router = require("express").Router();

router.post("/bank-details/add/:vendorid", AddPartnerBankDetials);
router.patch("/bank-details/update/:id", UpdatePartnerBankDetails);
router.delete("/bank-details/delete/:vendorid/:id", DeletePartnerBankDetails);
router.get("/bank-details/get/:vendorid");

module.exports = router;
