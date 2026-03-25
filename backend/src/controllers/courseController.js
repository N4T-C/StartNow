const Course = require("../models/Course");
const { createOrder } = require("../services/razorpayService");

const MOCK_COURSES = [
  {
    code: "SS-FOUND-01",
    title: "Startup Zero to One",
    subtitle: "Idea validation, GTM, and first 100 users in India",
    level: "Beginner",
    duration: "4 weeks",
    priceInr: 1499,
    highlights: ["Market sizing templates", "Founder execution playbook", "Mentor office hours"],
    isPremium: true,
  },
  {
    code: "SS-GROWTH-02",
    title: "Growth Engine Sprint",
    subtitle: "Design retention loops and channel experiments",
    level: "Intermediate",
    duration: "6 weeks",
    priceInr: 2499,
    highlights: ["Acquisition experiments", "Retention dashboards", "CAC-LTV framework"],
    isPremium: true,
  },
  {
    code: "SS-BIZOPS-03",
    title: "Business Ops for Scale",
    subtitle: "Operations, finance, and team systems for expansion",
    level: "Advanced",
    duration: "8 weeks",
    priceInr: 3999,
    highlights: ["Unit economics deep dive", "Hiring process kits", "Compliance checklist"],
    isPremium: true,
  },
];

async function ensureCoursesSeeded() {
  const existing = await Course.countDocuments();
  if (existing > 0) return;
  await Course.insertMany(MOCK_COURSES);
}

async function getCoursesController(_req, res) {
  try {
    await ensureCoursesSeeded();
    const courses = await Course.find().sort({ priceInr: 1 }).lean();
    return res.json({ courses });
  } catch {
    return res.status(500).json({ error: "Unable to fetch courses." });
  }
}

async function checkoutCourseController(req, res) {
  try {
    const courseCode = String(req.body?.courseCode || "").trim();
    if (!courseCode) {
      return res.status(400).json({ error: "courseCode is required." });
    }

    await ensureCoursesSeeded();
    const course = await Course.findOne({ code: courseCode }).lean();

    if (!course) {
      return res.status(404).json({ error: "Course not found." });
    }

    const order = await createOrder({
      amountInPaise: course.priceInr * 100,
      receipt: `course_${course.code}_${Date.now()}`,
      notes: { courseCode: course.code, title: course.title },
    });

    return res.json({
      checkout: {
        provider: "razorpay",
        mode: order.mode,
        keyId: process.env.RAZORPAY_KEY_ID || "mock_key",
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
      },
      course,
      message:
        order.mode === "mock"
          ? "Mock checkout created. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable live payments."
          : "Live Razorpay order created.",
    });
  } catch {
    return res.status(500).json({ error: "Unable to create checkout order." });
  }
}

module.exports = { getCoursesController, checkoutCourseController };
