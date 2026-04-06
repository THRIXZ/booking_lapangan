const bookingService = require("../../services/bookingService");
const courtService = require("../../services/courtService");

async function index(req, res, next) {
  try {
    const stats = await bookingService.getUserDashboardStats(req.currentUser.id);
    const popularCourts = await courtService.getPopularCourts();
    const bookings = await bookingService.getUserBookings(req.currentUser.id);

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
