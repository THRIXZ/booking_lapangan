const db = require("../config/db");

async function getAllCourts() {
  const [rows] = await db.execute(
    "SELECT * FROM courts ORDER BY created_at DESC, id DESC"
  );
  return rows;
}

async function getActiveCourts() {
  const [rows] = await db.execute(
    "SELECT * FROM courts WHERE status = 'active' ORDER BY created_at DESC, id DESC"
  );
  return rows;
}

async function getPopularCourts(limit = 3) {
  const safeLimit = Math.max(1, parseInt(limit, 10) || 3);
  const [rows] = await db.query(
    `SELECT * FROM courts WHERE status = 'active' ORDER BY created_at DESC, id DESC LIMIT ${safeLimit}`
  );
  return rows;
}

async function searchCourts({ q, type, price }) {
  const params = [];
  let sql = "SELECT * FROM courts WHERE status = 'active'";

  if (q) {
    sql += " AND name LIKE ?";
    params.push(`%${q}%`);
  }
  if (type && type !== "all") {
    sql += " AND type = ?";
    params.push(type);
  }
  if (price) {
    if (price === "<100") {
      sql += " AND price_per_hour < 100000";
    } else if (price === "100-200") {
      sql += " AND price_per_hour BETWEEN 100000 AND 200000";
    } else if (price === ">200") {
      sql += " AND price_per_hour > 200000";
    }
  }

  sql += " ORDER BY created_at DESC, id DESC";
  const [rows] = await db.execute(sql, params);
  return rows;
}

async function findCourtById(id) {
  const [rows] = await db.execute("SELECT * FROM courts WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0] || null;
}

async function createCourt({ name, type, pricePerHour, image, status }) {
  await db.execute(
    `INSERT INTO courts (name, type, price_per_hour, image, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [name, type, pricePerHour, image || null, status]
  );
}

async function updateCourt(id, { name, type, pricePerHour, image, status }) {
  await db.execute(
    `UPDATE courts
     SET name = ?, type = ?, price_per_hour = ?, image = ?, status = ?, updated_at = NOW()
     WHERE id = ?`,
    [name, type, pricePerHour, image || null, status, id]
  );
}

async function deleteCourt(id) {
  await db.execute("DELETE FROM courts WHERE id = ?", [id]);
}

module.exports = {
  getAllCourts,
  getActiveCourts,
  getPopularCourts,
  findCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  searchCourts,
};
