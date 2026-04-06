const userService = require("../services/userService");
const { setOldInput, setValidationErrors } = require("../utils/http");

function editProfile(req, res) {
  res.render("profile/edit", {
    title: "Profile",
  });
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, phone, password, password_confirmation } = req.body;
    const errors = [];

    if (!name) errors.push("Nama wajib diisi.");
    if (!email) errors.push("Email wajib diisi.");
    if (password && password !== password_confirmation) {
      errors.push("Konfirmasi password tidak cocok.");
    }

    const existing = await userService.findByEmail(email);
    if (existing && existing.id !== req.currentUser.id) {
      errors.push("Email sudah digunakan akun lain.");
    }

    if (errors.length) {
      setValidationErrors(req, errors);
      setOldInput(req, { name, email, phone });
      return res.redirect("/profile");
    }

    await userService.updateProfile(req.currentUser.id, { name, email, phone });
    if (password) {
      await userService.updatePassword(req.currentUser.id, password);
    }

    req.flash("success", "Profile berhasil diperbarui.");
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
}

async function destroyProfile(req, res, next) {
  try {
    await userService.deleteUser(req.currentUser.id);
    req.session.destroy(() => {
      res.redirect("/register");
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  editProfile,
  updateProfile,
  destroyProfile,
};
