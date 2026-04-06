const courtService = require("../../services/courtService");

async function index(req, res, next) {
  try {
    const courts = await courtService.getActiveCourts();
    res.render("user/courts/index", {
      title: "Daftar Lapangan",
      courts,
    });
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const court = await courtService.findCourtById(req.params.id);
    if (!court) {
      req.flash("error", "Lapangan tidak ditemukan.");
      return res.redirect("/user/courts");
    }

    res.render("user/courts/show", {
      title: court.name,
      court,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  show,
};
