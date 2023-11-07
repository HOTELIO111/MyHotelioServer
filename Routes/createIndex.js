const HotelModel = require("../Model/HotelModel/hotelModel");
const router = require("express").Router();

router.get("/createindex", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const hotelCollection = HotelModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    hotelCollection.createIndex({ address: "text" }, (err) => {
      if (err) {
        console.log("error in created index ");
      } else {
        console.log("created successfully ");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
