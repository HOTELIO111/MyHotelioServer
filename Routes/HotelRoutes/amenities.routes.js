const router = require('express').Router()


const {
    AddAmenity,
    GetAmenity,
    DeleteAllAmenity,
    UpdateAmenity,
    DeleteAmenity
} = require('./../../Controllers/HotelControllers/amenities.controllers')


// add the Amenities
router.post("/add", AddAmenity);
router.get('/delete/:id', DeleteAmenity);
router.patch('/update/:id', UpdateAmenity);
router.delete('/deleteall', DeleteAllAmenity);
router.get("/get", GetAmenity)








module.exports = router