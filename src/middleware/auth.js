const userService = require("../services/userService");

async function attachCurrentUser(req, res, next) {
  if (!req.session.userId) {
    return next();
  }

  try {
    const user = await userService.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return next();
    }

    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAuth(req, res, next) {
  if (!req.currentUser) {
    req.flash("error", "Silakan login terlebih dahulu.");
    return res.redirect("/login");
  }

  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.currentUser) {
      req.flash("error", "Silakan login terlebih dahulu.");
      return res.redirect("/login");
    }

    if (req.currentUser.role !== role) {
      req.flash("error", "Kamu tidak punya akses ke halaman tersebut.");
      return res.redirect("/dashboard");
    }

    next();
  };
}

module.exports = {
  attachCurrentUser,
  requireAuth,
  requireRole,
};
