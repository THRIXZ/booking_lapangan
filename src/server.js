const path = require("path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const routes = require("./routes");
const { attachCurrentUser } = require("./middleware/auth");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(attachCurrentUser);

app.use((req, res, next) => {
  res.locals.currentUser = req.currentUser || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  const vErr = req.flash("validationErrors");
  const normalized = Array.isArray(vErr[0]) ? vErr[0] : vErr;
  res.locals.validationErrors = Array.isArray(normalized) ? normalized : [];
  const fData = req.flash("formData");
  res.locals.formData = fData[0] || {};
  next();
});

app.use(routes);

app.use((req, res) => {
  res.status(404).render("errors/404", { title: "Page Not Found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("errors/500", {
    title: "Server Error",
    error,
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
