const courtService = require("../../services/courtService");
const bookingService = require("../../services/bookingService");
const { setOldInput, setValidationErrors } = require("../../utils/http");

function diffHours(date, start, end) {
  const startDate = new Date(`${date}T${start}`);
  const endDate = new Date(`${date}T${end}`);
  return (endDate - startDate) / (1000 * 60 * 60);
}

async function index(req, res, next) {
  try {
    const bookings = await bookingService.getUserBookings(req.currentUser.id);
    res.render("user/bookings/index", {
      title: "Booking Saya",
      bookings,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const courts = await courtService.getActiveCourts();
    const selectedCourt = req.query.court
      ? await courtService.findCourtById(req.query.court)
      : null;

    res.render("user/bookings/create", {
      title: "Buat Booking",
      courts,
      selectedCourt,
    });
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const { court_id, booking_date, start_time, end_time, notes } = req.body;
    const errors = [];

    if (!court_id) errors.push("Lapangan wajib dipilih.");
    if (!booking_date) errors.push("Tanggal booking wajib diisi.");
    if (!start_time) errors.push("Jam mulai wajib diisi.");
    if (!end_time) errors.push("Jam selesai wajib diisi.");

    const duration = booking_date && start_time && end_time
      ? diffHours(booking_date, start_time, end_time)
      : 0;

    if (duration <= 0) {
      errors.push("Jam selesai harus lebih besar dari jam mulai.");
    }

    const today = new Date().toISOString().slice(0, 10);
    if (booking_date && booking_date < today) {
      errors.push("Tanggal booking tidak boleh sebelum hari ini.");
    }

    const court = court_id ? await courtService.findCourtById(court_id) : null;
    if (!court) {
      errors.push("Lapangan tidak ditemukan.");
    }

    const hasConflict =
      !errors.length &&
      (await bookingService.hasBookingConflict({
        courtId: court_id,
        bookingDate: booking_date,
        startTime: `${start_time}:00`,
        endTime: `${end_time}:00`,
      }));

    if (hasConflict) {
      errors.push("Jadwal sudah dibooking pada waktu tersebut.");
    }

    if (errors.length) {
      setValidationErrors(req, errors);
      setOldInput(req, req.body);
      return res.redirect("/user/bookings/create");
    }

    await bookingService.createBooking({
      userId: req.currentUser.id,
      courtId: court_id,
      bookingDate: booking_date,
      startTime: `${start_time}:00`,
      endTime: `${end_time}:00`,
      duration,
      totalPrice: duration * Number(court.price_per_hour),
      status: "pending",
      paymentStatus: "unpaid",
      notes,
    });

    req.flash("success", "Booking berhasil dibuat.");
    res.redirect("/user/bookings");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  create,
  store,
};
