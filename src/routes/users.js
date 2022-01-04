var express = require("express");
var router = express.Router();
const {
  userList,
  userRegister,
  userLogin,
  authenticate,
  userLogout,
  userInfo,
  changePassword,
  changeProfile,
  googleLogin,
  updateStudentId,
  forgotPassword,
  resetPassword,
  activeAccount
} = require("../controllers/user.controller");
const { middleware } = require("../middlewares/jwt.middleware");

/* GET users listing. */
router.get("/", userList);
router.post('/forgotPassword', forgotPassword)
router.post('/resetPassword', resetPassword)
router.post('/active/:id', activeAccount)
router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/googlelogin", googleLogin);
router.post("/changepassword", middleware, changePassword);
router.post("/updateStudentId", middleware, updateStudentId);
router.post("/changeprofile", middleware, changeProfile);
router.get("/authenticate", authenticate);
router.get("/logout", middleware, userLogout);
router.get("/info", middleware, userInfo);

module.exports = router;
