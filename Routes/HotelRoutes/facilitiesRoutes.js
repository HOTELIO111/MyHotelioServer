const router = require('express').Router()
const RegisterValidate = require('../../validator/hotels/facilitiesValidate')
const {
    AddFacility,
    GetFacility,
    DeleteAllFacility,
    UpdateFacility,
    DeleteFacilities
} = require('../../Controllers/HotelControllers/faclilitesControllers')




// add the roomType
router.post("/add/:id", RegisterValidate, AddFacility);
router.get('/delete/:id', DeleteFacilities);
router.patch('/update/:id', RegisterValidate, UpdateFacility);
router.delete('/deleteall', DeleteAllFacility);
router.get("/get", GetFacility)







module.exports = router
