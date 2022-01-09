var express = require("express");
var router = express.Router();
const {
  ListUser,
  ListAdmin,
  ListClass,
  adminRegister,
  adminLogin,
  adminLogout,
  updateStudentId,
  DetailUser,
  DetailClass,
  authenticate
} = require("../controllers/admin.controller");
const { middlewareAdmin } = require("../middlewares/jwt.middleware");

/* GET users listing. */
router.post("/register", middlewareAdmin , adminRegister);
router.post("/login", adminLogin);
router.get("/authenticate", authenticate);
router.get("/logout", middlewareAdmin, adminLogout);
router.get("/list-user", middlewareAdmin, ListUser);
router.get("/detail-user/:userId", middlewareAdmin, DetailUser);
router.get("/list-admin", middlewareAdmin, ListAdmin);
router.get("/list-class", middlewareAdmin, ListClass);
router.get("/detail-class/:classId", middlewareAdmin, DetailClass);
router.post("/update-student-id", middlewareAdmin, updateStudentId);

module.exports = router;
