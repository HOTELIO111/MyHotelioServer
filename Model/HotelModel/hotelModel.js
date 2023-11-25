const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    counts: {
      type: Number,
      default: 1,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "room-category",
    },
    price: Number,
    prevPrice: String,
    status: {
      type: Boolean,
      default: true,
    },
    additionAmenities: {
      type: Array,
    },
    additionalFacilties: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const schema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel-partners",
      required: function () {
        return this.isAddedBy === "vendor";
      },
    },
    isAddedBy: {
      type: String,
      default: "vendor",
      required: true,
    },
    // Hotel Details
    hotelName: {
      type: String,
      index: "text",
    },
    hotelType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "property-types",
    },
    hotelEmail: {
      type: String,
    },
    hotelMobileNo: {
      type: Number,
    },
    locality: {
      type: String,
    },
    address: {
      type: String,
      index: "text",
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipCode: {
      type: Number,
    },
    discription: {
      type: String,
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    // Hotel rooms info
    rooms: [roomSchema],
    amenities: {
      type: Array,
    },
    facilities: {
      type: Array,
    },
    hotelCoverImg: {
      type: String,
    },
    hotelImages: {
      type: Array,
    },
    checkOut: {
      type: String,
    },
    checkIn: {
      type: String,
    },

    // Legal Documents
    ownershipType: String,
    regNo: String,
    regDocumentImg: String,
    businessPan: String,
    businessPanImg: String,
    gstNo: String,
    gstImg: String,

    // Policy and privacy
    cancellationPrice: String,
    cancellationPolicy: String,
    termsAndCondition: {
      type: Boolean,
      default: false,
    },
    hotelFullySanitized: {
      type: Boolean,
      default: false,
    },
    notSupportDiscrimination: {
      type: Boolean,
      default: false,
    },
    validAndTrueData: {
      type: Boolean,
      default: false,
    },

    // Hotel Bookings
    bookings: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    },
    // Sir hi jane
    hotelMapLink: {
      type: String,
      required: true,
    },
    isAdminApproved: Boolean,
    isPostpaidAllowed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    hotelRatings: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5],
      default: 3,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "reviews" }],
  },
  {
    timestamps: true,
  }
);

schema.index({ location: "2dsphere" });

const HotelModel = mongoose.model("Hotels", schema);

module.exports = HotelModel;
