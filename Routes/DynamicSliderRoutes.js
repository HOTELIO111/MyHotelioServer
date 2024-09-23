const DynamicImgSlderModel = require("../Model/DynamicImageSlider");
const router = require("express").Router();

router.get("/add-in-slider", async (req, res) => {
  const { imgurl } = req.query;
  try {
    const response = await new DynamicImgSlderModel({ img: imgurl }).save();
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "select the image first" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.get("/update-in-slider/:id", async (req, res) => {
  const { imgurl } = req.query;
  const { id } = req.params;

  try {
    const response = await DynamicImgSlderModel.findByIdAndUpdate(
      id,
      {
        img: imgurl,
      },
      { new: true }
    );
    if (!response)
      return res.status(400).json({ error: true, message: "missing img link" });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.get("/delete-in-slider/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await DynamicImgSlderModel.findByIdAndDelete(id);
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "no data found with this id " });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

router.get("/get-in-slider", async (req, res) => {
  const { id } = req.query;
  const _find = id ? { _id: id } : {};

  try {
    const response = await DynamicImgSlderModel.find(_find);
    if (!response)
      return res
        .status(400)
        .json({ error: true, message: "no data found with this id " });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;
