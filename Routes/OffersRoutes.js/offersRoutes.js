const router = require("express").Router();
const {
  CreateOffer,
  UpdateOffer,
  DeleteOffers,
  GetAllOfferCode,
  GetHotelOffers,
} = require("../../Controllers/OfferControllers/OfferControllers");

router.post("/create-offers", CreateOffer);
router.get("/get-offers", GetAllOfferCode);
router.patch("/update-offers/:id", UpdateOffer);
router.delete("/delete-offers", DeleteOffers);
router.get("/get-offers/hotel", GetHotelOffers);




module.exports = router;
