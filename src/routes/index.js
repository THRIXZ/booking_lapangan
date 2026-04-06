const express = require("express");
const authController = require("../controllers/authController");
const profileController = require("../controllers/profileController");
const adminDashboardController = require("../controllers/admin/dashboardController");
const adminCourtController = require("../controllers/admin/courtController");
const adminScheduleController = require("../controllers/admin/scheduleController");
const adminBookingController = require("../controllers/admin/bookingController");
const userDashboardController = require("../controllers/user/dashboardController");
const userCourtController = require("../controllers/user/courtController");
const userBookingController = require("../controllers/user/bookingController");
const { requireAuth, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/", (req, res) => res.redirect("/login"));

router.get("/login", authController.showLogin);
router.post("/login", authController.login);
router.get("/register", authController.showRegister);
router.post("/register", authController.register);
router.post("/logout", requireAuth, authController.logout);

router.get("/dashboard", requireAuth, (req, res) => {
  if (req.currentUser.role === "admin") {
    return res.redirect("/admin/dashboard");
  }
  return res.redirect("/user/dashboard");
});

router.get("/profile", requireAuth, profileController.editProfile);
router.patch("/profile", requireAuth, profileController.updateProfile);
router.delete("/profile", requireAuth, profileController.destroyProfile);

router.get("/user/dashboard", requireRole("user"), userDashboardController.index);
router.get("/user/courts", requireRole("user"), userCourtController.index);
router.get("/user/courts/:id", requireRole("user"), userCourtController.show);
router.get("/user/bookings", requireRole("user"), userBookingController.index);
router.get("/user/bookings/create", requireRole("user"), userBookingController.create);
router.post("/user/bookings", requireRole("user"), userBookingController.store);

router.get("/admin/dashboard", requireRole("admin"), adminDashboardController.index);
router.get("/admin/courts", requireRole("admin"), adminCourtController.index);
router.get("/admin/courts/create", requireRole("admin"), adminCourtController.create);
router.post("/admin/courts", requireRole("admin"), upload.single("image_file"), adminCourtController.store);
router.get("/admin/courts/:id/edit", requireRole("admin"), adminCourtController.edit);
router.put("/admin/courts/:id", requireRole("admin"), upload.single("image_file"), adminCourtController.update);
router.delete("/admin/courts/:id", requireRole("admin"), adminCourtController.destroy);

router.get("/admin/schedules", requireRole("admin"), adminScheduleController.index);
router.get("/admin/schedules/create", requireRole("admin"), adminScheduleController.create);
router.post("/admin/schedules", requireRole("admin"), adminScheduleController.store);
router.get("/admin/schedules/:id/edit", requireRole("admin"), adminScheduleController.edit);
router.put("/admin/schedules/:id", requireRole("admin"), adminScheduleController.update);
router.delete("/admin/schedules/:id", requireRole("admin"), adminScheduleController.destroy);

router.get("/admin/bookings", requireRole("admin"), adminBookingController.index);
router.get("/admin/bookings/:id/edit", requireRole("admin"), adminBookingController.edit);
router.put("/admin/bookings/:id", requireRole("admin"), adminBookingController.update);

module.exports = router;
