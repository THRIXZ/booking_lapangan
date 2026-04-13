const userService = require("../services/userService");
const { setOldInput, setValidationErrors } = require("../utils/http");

function showLogin(req, res) {
  if (req.currentUser) {
    return res.redirect("/dashboard");
  }

  res.render("auth/login", {
    title: "Login",
    hideNavbar: true,
    compactFooter: true,
  });
}

function showRegister(req, res) {
  if (req.currentUser) {
    return res.redirect("/dashboard");
  }

  res.render("auth/register", {
    title: "Register",
    hideNavbar: true,
    compactFooter: true,
  });
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push("Email wajib diisi.");
    if (!password) errors.push("Password wajib diisi.");

    if (errors.length) {
      setValidationErrors(req, errors);
      setOldInput(req, { email });
      return res.redirect("/login");
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      req.flash("error", "Email atau password tidak valid.");
      setOldInput(req, { email });
      return res.redirect("/login");
    }

    const isValid = await userService.verifyPassword(password, user.password);
    if (!isValid) {
      req.flash("error", "Email atau password tidak valid.");
      setOldInput(req, { email });
      return res.redirect("/login");
    }

    req.session.userId = user.id;
    req.flash("success", "Login berhasil.");
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, password_confirmation } = req.body;
    const errors = [];

    if (!name) errors.push("Nama wajib diisi.");
    if (!email) errors.push("Email wajib diisi.");
    if (!password) errors.push("Password wajib diisi.");
    if (password !== password_confirmation) {
      errors.push("Konfirmasi password tidak cocok.");
    }

    const existing = email ? await userService.findByEmail(email) : null;
    if (existing) {
      errors.push("Email sudah terdaftar.");
    }

    if (errors.length) {
      setValidationErrors(req, errors);
      setOldInput(req, { name, email, phone });
      return res.redirect("/register");
    }

    const user = await userService.createUser({ name, email, phone, password });
    req.session.userId = user.id;
    req.flash("success", "Akun berhasil dibuat.");
    res.redirect("/dashboard");
  } catch (error) {
    const msg =
      error.code === "ER_ACCESS_DENIED_ERROR"
        ? "Koneksi database gagal: periksa user/password MySQL."
        : error.code === "ER_BAD_DB_ERROR"
        ? "Database belum dibuat. Jalankan schema.sql terlebih dahulu."
        : error.code === "ECONNREFUSED"
        ? "MySQL belum berjalan. Nyalakan service MySQL."
        : null;

    if (msg) {
      setOldInput(req, req.body);
      req.flash("error", msg);
      return res.redirect("/register");
    }

    next(error);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

module.exports = {
  showLogin,
  showRegister,
  login,
  register,
  logout,
};
