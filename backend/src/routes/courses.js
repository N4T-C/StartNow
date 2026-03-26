const express = require("express");
const { getCoursesController, checkoutCourseController } = require("../controllers/courseController");

const router = express.Router();

router.get("/courses", getCoursesController);
router.post("/courses/checkout", checkoutCourseController);

module.exports = router;
