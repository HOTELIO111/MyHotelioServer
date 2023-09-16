const { AddPropertyType, DeletePropertyTypes, GetThePropertyTypes } = require('../../Controllers/HotelControllers/propertyTypesControllers');

const router = require('express').Router()



// Addd the property type 
router.get("/add", AddPropertyType)
router.get("/delete", DeletePropertyTypes)
router.get("/get", GetThePropertyTypes)





module.exports = router;



