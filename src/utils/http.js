function setOldInput(req, payload = {}) {
  req.flash("formData", payload);
}

function setValidationErrors(req, errors = []) {
  req.flash("validationErrors", errors);
}

module.exports = {
  setOldInput,
  setValidationErrors,
};
