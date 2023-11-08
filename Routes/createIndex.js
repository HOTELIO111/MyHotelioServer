const HotelModel = require("../Model/HotelModel/hotelModel");
const Booking = require("../Model/booking/bookingModel");
const router = require("express").Router();

router.get("/createindex/address", async (req, res) => {
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

router.get("/createindex/booking", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = Booking.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ bookingDate: 1 }, (err) => {
      if (err) {
        console.log("error in created index ");
      } else {
        console.log("created successfully ");
        res.json("success");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/createindex/hotelrooms", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const hotelCollection = HotelModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    hotelCollection.createIndex(
      {
        "rooms._id": 1,
        "rooms.roomType.title": 1,
        "rooms.counts": 1,
        "rooms.price": 1,
      },
      (err) => {
        if (err) {
          console.log("error in created index ");
        } else {
          console.log("created successfully ");
          res.json("success");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
