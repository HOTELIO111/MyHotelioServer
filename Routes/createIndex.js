const CustomerAuthModel = require("../Model/CustomerModels/customerModel");
const HotelModel = require("../Model/HotelModel/hotelModel");
const KycModel = require("../Model/HotelModel/kycModel");
const RoomsTypeModel = require("../Model/HotelModel/roomsTypeModel");
const Booking = require("../Model/booking/bookingModel");
const VerificationModel = require("../Model/other/VerificationModel");
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

router.get("/createindex/customer", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = CustomerAuthModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ email: 1 }, (err) => {
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

router.get("/createindex/verification", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = VerificationModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ verificationOtp: 1 }, (err) => {
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

// kyc
router.get("/createindex/kyc", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = KycModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ vendorId: 1 }, (err) => {
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

router.get("/createindex/hotelRoomPrice", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = HotelModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ "rooms.price": 1 }, (err) => {
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

router.get("/createindex/roomTypeamenites", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = RoomsTypeModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ amenties: 1 }, (err) => {
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

router.get("/createindex/bookingDate", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = Booking.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex(
      {
        "bookingDate.checkIn": 1,
        "bookingDate.checkOut": 1,
        bookingStatus: 1,
        numberOfRooms: 1,
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

router.get("/createindex/roomTypeAmenities", async (req, res) => {
  try {
    // Get the MongoDB collection for the model
    const bookingCollection = HotelModel.collection;
    // hotelCollection.createIndex({ address: "text" }, (err) => {
    bookingCollection.createIndex({ "rooms.roomType": 1 }, (err) => {
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

module.exports = router;
