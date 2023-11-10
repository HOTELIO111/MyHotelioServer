const {
  AddPropertyType,
  DeletePropertyTypes,
  GetThePropertyTypes,
  GetUpdatePropertyType,
} = require("../../Controllers/HotelControllers/propertyTypesControllers");

const router = require("express").Router();

// Addd the property type
router.get("/add", AddPropertyType);
router.get("/delete", DeletePropertyTypes);
router.get("/get", GetThePropertyTypes);
router.get("/update/:id", GetUpdatePropertyType);

module.exports = router;
