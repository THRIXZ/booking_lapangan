const bookingService = require("../../services/bookingService");
const courtService = require("../../services/courtService");

async function index(req, res, next) {
  try {
    const [statsResult, popularCourtsResult, bookingsResult] = await Promise.allSettled([
      bookingService.getUserDashboardStats(req.currentUser.id),
      courtService.getPopularCourts(),
      bookingService.getUserBookings(req.currentUser.id),
    ]);

    const stats =
      statsResult.status === "fulfilled"
        ? statsResult.value
        : { totalBookings: 0, upcomingBookings: 0, completedBookings: 0 };
    const popularCourts =
      popularCourtsResult.status === "fulfilled" ? popularCourtsResult.value : [];
    const bookings =
      bookingsResult.status === "fulfilled" ? bookingsResult.value : [];

    if (statsResult.status === "rejected") {
      console.error("Failed to load user dashboard stats:", statsResult.reason);
    }
    if (popularCourtsResult.status === "rejected") {
      console.error("Failed to load popular courts:", popularCourtsResult.reason);
    }
    if (bookingsResult.status === "rejected") {
      console.error("Failed to load user bookings:", bookingsResult.reason);
    }

    res.render("user/dashboard", {
      title: "User Dashboard",
      stats,
      popularCourts,
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { index };
