const {
  AddPropertyType,
  DeletePropertyTypes,
  GetThePropertyTypes,
  GetUpdatePropertyType,
  OurCollectionsMobile,
} = require("../../Controllers/HotelControllers/propertyTypesControllers");

const router = require("express").Router();

// Addd the property type
router.post("/add", AddPropertyType);
router.get("/delete", DeletePropertyTypes);
router.get("/get", GetThePropertyTypes);
router.patch("/update/:id", GetUpdatePropertyType);
router.get("/get-collections", OurCollectionsMobile);

module.exports = router;
