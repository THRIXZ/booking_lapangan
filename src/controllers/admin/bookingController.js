const bookingService = require("../../services/bookingService");

async function index(req, res, next) {
  try {
    const bookings = await bookingService.getAllBookings();
    res.render("admin/bookings/index", {
      title: "Manage Bookings",
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

async function edit(req, res, next) {
  try {
    const booking = await bookingService.findBookingById(req.params.id);
    if (!booking) {
      req.flash("error", "Booking tidak ditemukan.");
      return res.redirect("/admin/bookings");
    }

    res.render("admin/bookings/edit", {
      title: "Edit Booking",
      booking,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    await bookingService.updateBookingStatus(req.params.id, {
      status: req.body.status,
      paymentStatus: req.body.payment_status,
    });

    req.flash("success", "Status booking berhasil diperbarui.");
    res.redirect("/admin/bookings");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  edit,
  update,
};
