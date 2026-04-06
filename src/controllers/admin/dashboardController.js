const bookingService = require("../../services/bookingService");

async function index(req, res, next) {
  try {
    const stats = await bookingService.getAdminDashboardStats();
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { index };
