const path = require("path");

function normalizeCourtImage(image) {
  if (!image || typeof image !== "string") {
    return null;
  }

  const trimmed = image.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed)) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/\\/g, "/");
  const uploadsMarker = "/uploads/";
  const uploadsIndex = normalizedPath.lastIndexOf(uploadsMarker);

  if (uploadsIndex !== -1) {
    return normalizedPath.slice(uploadsIndex);
  }

  const filename = path.basename(normalizedPath);
  if (filename && filename !== "." && filename !== "/") {
    return `/uploads/${filename}`;
  }

  return null;
}

function normalizeCourtRecord(court) {
  if (!court) {
    return court;
  }

  return {
    ...court,
    image: normalizeCourtImage(court.image),
  };
}

module.exports = {
  normalizeCourtImage,
  normalizeCourtRecord,
};
