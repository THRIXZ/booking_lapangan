const courtService = require("../../services/courtService");
const { setOldInput, setValidationErrors } = require("../../utils/http");
const { normalizeCourtImage } = require("../../utils/courtImage");

async function index(req, res, next) {
  try {
    const courts = await courtService.getAllCourts();
    res.render("admin/courts/index", { title: "Manage Courts", courts });
  } catch (error) {
    next(error);
  }
}

function create(req, res) {
  res.render("admin/courts/create", { title: "Tambah Lapangan" });
}

async function store(req, res, next) {
  try {
    const { name, type, price_per_hour, image, status } = req.body;
    const errors = [];

    if (!name) errors.push("Nama lapangan wajib diisi.");
    if (!type) errors.push("Jenis lapangan wajib diisi.");
    if (!price_per_hour || Number(price_per_hour) < 0) {
      errors.push("Harga per jam harus valid.");
    }

    if (errors.length) {
      setValidationErrors(req, errors);
      setOldInput(req, req.body);
      return res.redirect("/admin/courts/create");
    }

    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;
    const imagePath = uploadedImage || normalizeCourtImage(image);

    await courtService.createCourt({
      name,
      type,
      pricePerHour: Number(price_per_hour),
      image: imagePath,
      status: status || "active",
    });

    req.flash("success", "Lapangan berhasil ditambahkan.");
    res.redirect("/admin/courts");
  } catch (error) {
    next(error);
  }
}

async function edit(req, res, next) {
  try {
    const court = await courtService.findCourtById(req.params.id);
    if (!court) {
      req.flash("error", "Lapangan tidak ditemukan.");
      return res.redirect("/admin/courts");
    }

    res.render("admin/courts/edit", { title: "Edit Lapangan", court });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { name, type, price_per_hour, image, status } = req.body;
    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;
    const imagePath = uploadedImage || normalizeCourtImage(image);

    await courtService.updateCourt(req.params.id, {
      name,
      type,
      pricePerHour: Number(price_per_hour),
      image: imagePath,
      status,
    });

    req.flash("success", "Lapangan berhasil diperbarui.");
    res.redirect("/admin/courts");
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await courtService.deleteCourt(req.params.id);
    req.flash("success", "Lapangan berhasil dihapus.");
    res.redirect("/admin/courts");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  create,
  store,
  edit,
  update,
  destroy,
};
