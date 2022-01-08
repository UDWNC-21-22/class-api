var express = require("express");
var router = express.Router();
const {
  ListUser,
  ListAdmin,
  ListClass,
  adminRegister,
  activeAccount,
  adminLogin,
  authenticate,
  adminInfo,
  adminLogout,
  updateStudentId
} = require("../controllers/admin.controller");
const { middlewareAdmin } = require("../middlewares/jwt.middleware");

/* GET users listing. */
router.post('/active/:id', activeAccount)
router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.get("/authenticate", authenticate);
router.get("/logout", middlewareAdmin, adminLogout);
router.get("/info", middlewareAdmin, adminInfo);
router.get("/list-user", middlewareAdmin, ListUser);
router.get("/list-admin", middlewareAdmin, ListAdmin);
router.get("/list-class", middlewareAdmin, ListClass);
router.post("/update-student-id", middlewareAdmin, updateStudentId);

module.exports = router;
