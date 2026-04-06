const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function findByEmail(email) {
  const [rows] = await db.execute(
    "SELECT id, name, email, password, phone, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.execute(
    "SELECT id, name, email, phone, role FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, phone, password, role = "user" }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.execute(
    `INSERT INTO users (name, email, phone, password, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [name, email, phone || null, hashedPassword, role]
  );

  return findById(result.insertId);
}

async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

async function updateProfile(userId, { name, email, phone }) {
  await db.execute(
    `UPDATE users
     SET name = ?, email = ?, phone = ?, updated_at = NOW()
     WHERE id = ?`,
    [name, email, phone || null, userId]
  );

  return findById(userId);
}

async function updatePassword(userId, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.execute(
    "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
    [hashedPassword, userId]
  );
}

async function deleteUser(userId) {
  await db.execute("DELETE FROM users WHERE id = ?", [userId]);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  verifyPassword,
  updateProfile,
  updatePassword,
  deleteUser,
};
