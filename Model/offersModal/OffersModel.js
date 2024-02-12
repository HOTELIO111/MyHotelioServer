const { model, Schema, default: mongoose } = require("mongoose");

const offerSchema = new Schema(
  {
    code: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    validation: {
      upto: {
        type: Date,
      },
      validFor: {
        type: String,
        required: true,
        enum: ["customer", "agent"],
        default: "customer",
      },
      minTransactions: {
        type: Number,
        default: 0,
      },
      roomtype: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "room-categories",
        },
      ],
    },
    codeDiscount: {
      amount: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0,
      },
    },
    usedByCustomers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "customers" },
    ],
    usedByAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: "agents" }],
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ "validation.upto": 1 });

const OfferModel = model("Offers", offerSchema);

module.exports = OfferModel;
