const db = require("../config/db");

async function getAllSchedules() {
  const [rows] = await db.execute(
    `SELECT schedules.*, courts.name AS court_name
     FROM schedules
     JOIN courts ON courts.id = schedules.court_id
     ORDER BY schedules.date DESC, schedules.start_time ASC`
  );
  return rows;
}

async function findScheduleById(id) {
  const [rows] = await db.execute("SELECT * FROM schedules WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0] || null;
}

async function createSchedule({ courtId, date, startTime, endTime, isAvailable }) {
  await db.execute(
    `INSERT INTO schedules (court_id, date, start_time, end_time, is_available, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [courtId, date, startTime, endTime, isAvailable]
  );
}

async function updateSchedule(id, { courtId, date, startTime, endTime, isAvailable }) {
  await db.execute(
    `UPDATE schedules
     SET court_id = ?, date = ?, start_time = ?, end_time = ?, is_available = ?, updated_at = NOW()
     WHERE id = ?`,
    [courtId, date, startTime, endTime, isAvailable, id]
  );
}

async function deleteSchedule(id) {
  await db.execute("DELETE FROM schedules WHERE id = ?", [id]);
}

module.exports = {
  getAllSchedules,
  findScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
