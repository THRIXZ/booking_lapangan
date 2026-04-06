const courtService = require("../../services/courtService");
const scheduleService = require("../../services/scheduleService");
const { setOldInput, setValidationErrors } = require("../../utils/http");

async function index(req, res, next) {
  try {
    const schedules = await scheduleService.getAllSchedules();
    res.render("admin/schedules/index", {
      title: "Manage Schedules",
      schedules,
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const courts = await courtService.getActiveCourts();
    res.render("admin/schedules/create", {
      title: "Tambah Jadwal",
      courts,
    });
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const { court_id, date, start_time, end_time, is_available } = req.body;
    const errors = [];

    if (!court_id) errors.push("Lapangan wajib dipilih.");
    if (!date) errors.push("Tanggal wajib diisi.");
    if (!start_time) errors.push("Jam mulai wajib diisi.");
    if (!end_time) errors.push("Jam selesai wajib diisi.");
    if (start_time && end_time && start_time >= end_time) {
      errors.push("Jam selesai harus lebih besar dari jam mulai.");
    }

    if (errors.length) {
      setValidationErrors(req, errors);
      setOldInput(req, req.body);
      return res.redirect("/admin/schedules/create");
    }

    await scheduleService.createSchedule({
      courtId: court_id,
      date,
      startTime: start_time,
      endTime: end_time,
      isAvailable: Number(is_available || 0),
    });

    req.flash("success", "Jadwal berhasil ditambahkan.");
    res.redirect("/admin/schedules");
  } catch (error) {
    next(error);
  }
}

async function edit(req, res, next) {
  try {
    const schedule = await scheduleService.findScheduleById(req.params.id);
    const courts = await courtService.getActiveCourts();
    if (!schedule) {
      req.flash("error", "Jadwal tidak ditemukan.");
      return res.redirect("/admin/schedules");
    }

    res.render("admin/schedules/edit", {
      title: "Edit Jadwal",
      schedule,
      courts,
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    await scheduleService.updateSchedule(req.params.id, {
      courtId: req.body.court_id,
      date: req.body.date,
      startTime: req.body.start_time,
      endTime: req.body.end_time,
      isAvailable: Number(req.body.is_available || 0),
    });

    req.flash("success", "Jadwal berhasil diperbarui.");
    res.redirect("/admin/schedules");
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await scheduleService.deleteSchedule(req.params.id);
    req.flash("success", "Jadwal berhasil dihapus.");
    res.redirect("/admin/schedules");
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
