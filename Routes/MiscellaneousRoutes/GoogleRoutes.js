const { default: axios } = require("axios");

const router = require("express").Router();

// Get the location throught the place name
router.get("/get-location", async (req, res) => {
  const { place } = req.query;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${place}&key=AIzaSyD_kgE_S3Nwf1IAamPa6D6ZyyazleBTrhI`
    );
    if (response.status === 200) {
      res.status(200).json({ error: false, data: response.data });
    }
  } catch (error) {
    console.log({ error: true, message: error.message });
  }
});

module.exports = router;
