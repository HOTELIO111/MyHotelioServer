const {
  CreateFilter,
  GetAllTheCategories,
  UpdateFilter,
  DeleteTheHotelFilter,
} = require("../../Controllers/HotelControllers/HotelFitlerCateControllers");

const router = require("express").Router();

router.post("/create", CreateFilter);
router.get("/get", GetAllTheCategories);
router.patch("/update/:id", UpdateFilter);
router.delete("/delete/:id", DeleteTheHotelFilter);

module.exports = router;
