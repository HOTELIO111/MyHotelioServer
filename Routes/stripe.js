// This is your test secret API key.
const stripe = require("stripe")(
  "sk_test_51O2tezSBvo7xLGZX3jzzmLYKK6OBDsrVqeoqxDHFCGINEhDxQxpMnJLWGYazRkowQMTFDH0rFeS8GKDhULjVhEPe00U6JH2t7E"
);
const router = require("express").Router();
const YOUR_DOMAIN = "http://localhost:3001";

router.post("/create-checkout-session", async (req, res) => {
  const { hotelData, bookingData } = req.body;

  const lineItems = hotelData.map((hotel) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: hotel.hotelName,
        images: hotel.hotelImages,
      },
      unit_amount: Math.round(hotel.price) * 100,
    },
    quantity: hotel.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: "http://localhost:3000/Payment_success",
    cancel_url: "http://localhost:3000/Payment_failed",
  });

  res.json({ id: session.id });
});

module.exports = router;
