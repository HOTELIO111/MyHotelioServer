const {
  CreateReview,
  UpdateTheReview,
  GetAllReviews,
  GetTheReviewsByMatchingFields,
  GetSingleReview,
  DeleteTheReview,
  GethotelReviews,
} = require("../../Controllers/Reviews/reviewsControllers");
const {
  DeleteReviewsMiddleWare,
} = require("../../middlewares/Reviews/ReviewsMiddlewares");
const { CreateReviewDataValidate } = require("../../validator/Reviews/reviews");

const router = require("express").Router();

router.post("/create", CreateReviewDataValidate, CreateReview);
router.patch("/update/:id", UpdateTheReview);
router.get("/get/:id", GetSingleReview);
router.get("/getall", GetAllReviews);
router.get("/get", GetTheReviewsByMatchingFields);
router.delete("/delete/:id", DeleteReviewsMiddleWare, DeleteTheReview);
router.get("/get/hotel/:hotelid", GethotelReviews);

module.exports = router;
