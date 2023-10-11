const BookingSequence = require("../../Model/other/BookingId");

const GenerateBookingId = async () => {
  let SeqData;
  SeqData = await BookingSequence.findOneAndUpdate(
    {},
    { $inc: { seq: 1 } },
    { new: true }
  );

  if (!SeqData) {
    SeqData = await new BookingSequence({
      id: "HT",
      seq: 1,
    }).save();
  }
  SeqData.seq++;
  return `HT${SeqData.seq.toString().padStart(7, "0")}`;
};

module.exports = GenerateBookingId;
