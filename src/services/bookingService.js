const db = require("../config/db");

async function getUserBookings(userId) {
  try {
    const [rows] = await db.execute(
      `SELECT bookings.*, courts.name AS court_name, courts.type AS court_type
       FROM bookings
       JOIN courts ON courts.id = bookings.court_id
       WHERE bookings.user_id = ?
       ORDER BY bookings.created_at DESC, bookings.id DESC`,
      [userId]
    );
    return rows;
  } catch (error) {
    // Older production schemas may not have every joined column yet.
    if (error.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }

    const [rows] = await db.execute(
      `SELECT bookings.*, courts.name AS court_name
       FROM bookings
       JOIN courts ON courts.id = bookings.court_id
       WHERE bookings.user_id = ?
       ORDER BY bookings.id DESC`,
      [userId]
    );
    return rows;
  }
}

async function getAllBookings() {
  const [rows] = await db.execute(
    `SELECT bookings.*, users.name AS user_name, users.email AS user_email,
            courts.name AS court_name, courts.type AS court_type
     FROM bookings
     JOIN users ON users.id = bookings.user_id
     JOIN courts ON courts.id = bookings.court_id
     ORDER BY bookings.created_at DESC, bookings.id DESC`
  );
  return rows;
}

async function findBookingById(id) {
  const [rows] = await db.execute(
    `SELECT bookings.*, users.name AS user_name, users.email AS user_email,
            courts.name AS court_name, courts.type AS court_type
     FROM bookings
     JOIN users ON users.id = bookings.user_id
     JOIN courts ON courts.id = bookings.court_id
     WHERE bookings.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function hasBookingConflict({ courtId, bookingDate, startTime, endTime }) {
  const [rows] = await db.execute(
    `SELECT id
     FROM bookings
     WHERE court_id = ?
       AND booking_date = ?
       AND start_time < ?
       AND end_time > ?
     LIMIT 1`,
    [courtId, bookingDate, endTime, startTime]
  );

  return rows.length > 0;
}

async function createBooking(payload) {
  await db.execute(
    `INSERT INTO bookings
      (user_id, court_id, booking_date, start_time, end_time, duration, total_price, status, payment_status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      payload.userId,
      payload.courtId,
      payload.bookingDate,
      payload.startTime,
      payload.endTime,
      payload.duration,
      payload.totalPrice,
      payload.status,
      payload.paymentStatus,
      payload.notes || null,
    ]
  );
}

async function updateBookingStatus(id, { status, paymentStatus }) {
  await db.execute(
    `UPDATE bookings
     SET status = ?, payment_status = ?, updated_at = NOW()
     WHERE id = ?`,
    [status, paymentStatus, id]
  );
}

async function getUserDashboardStats(userId) {
  let totals;

  try {
    [[totals]] = await db.execute(
      `SELECT
          COUNT(*) AS totalBookings,
          SUM(CASE WHEN booking_date >= CURDATE() AND status <> 'cancelled' THEN 1 ELSE 0 END) AS upcomingBookings,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedBookings
       FROM bookings
       WHERE user_id = ?`,
      [userId]
    );
  } catch (error) {
    // Keep the dashboard alive when production is running an older bookings schema.
    if (error.code !== "ER_BAD_FIELD_ERROR") {
      throw error;
    }

    [[totals]] = await db.execute(
      `SELECT
          COUNT(*) AS totalBookings,
          SUM(CASE WHEN booking_date >= CURDATE() THEN 1 ELSE 0 END) AS upcomingBookings,
          0 AS completedBookings
       FROM bookings
       WHERE user_id = ?`,
      [userId]
    );
  }

  return {
    totalBookings: Number(totals.totalBookings || 0),
    upcomingBookings: Number(totals.upcomingBookings || 0),
    completedBookings: Number(totals.completedBookings || 0),
  };
}

async function getAdminDashboardStats() {
  const [[courtRows]] = await db.execute("SELECT COUNT(*) AS totalCourts FROM courts");
  const [[scheduleRows]] = await db.execute("SELECT COUNT(*) AS totalSchedules FROM schedules");
  const [[bookingRows]] = await db.execute("SELECT COUNT(*) AS totalBookings FROM bookings");
  const [[todayRows]] = await db.execute(
    "SELECT COUNT(*) AS todayBookings FROM bookings WHERE booking_date = CURDATE()"
  );
  const [[revenueRows]] = await db.execute(
    "SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM bookings WHERE payment_status = 'paid'"
  );

  return {
    totalCourts: Number(courtRows.totalCourts || 0),
    totalSchedules: Number(scheduleRows.totalSchedules || 0),
    totalBookings: Number(bookingRows.totalBookings || 0),
    todayBookings: Number(todayRows.todayBookings || 0),
    totalRevenue: Number(revenueRows.totalRevenue || 0),
  };
}

module.exports = {
  getUserBookings,
  getAllBookings,
  findBookingById,
  hasBookingConflict,
  createBooking,
  updateBookingStatus,
  getUserDashboardStats,
  getAdminDashboardStats,
};
