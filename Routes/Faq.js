const {
  createFaq,
  UpdateFaq,
  DeleteTheFaq,
  GetSingleFaq,
  GetAllFaq,
  GetFaqByField
} = require("./../Controllers/faqcontrollers");

const router = require("express").Router();

router.post("/create", createFaq);
router.patch("/update/:id", UpdateFaq);
router.delete("/delete/:id", DeleteTheFaq);
router.get("/get/:id", GetSingleFaq);
router.get("/getbyuser" , GetFaqByField)
router.get("/getall", GetAllFaq);

module.exports = router;
