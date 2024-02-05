const {
  CreateContactSubmit,
  deleteContact,
  GetAllContact,
  UpdateContactStatus,
  UpdateContactUs,
} = require("../Controllers/contactController");

const router = require("express").Router();

router.post("/create", CreateContactSubmit);
router.delete("/delete/:id", deleteContact);
router.get("/get", GetAllContact);
router.patch("/update/:id", UpdateContactUs);
router.get("/update-status/:id/:status", UpdateContactStatus);
module.exports = router;
