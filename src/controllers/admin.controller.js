const { StatusCodes } = require("http-status-codes");
const { OK, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY } = StatusCodes;
const { validateEmail } = require("../helpers/form.helper");
const { Admin, adminModel } = require("../models/admin.model");
const { Class, classModel } = require("../models/class.model");
const { User, userModel } = require("../models/user.model");
const { ClassDTO, MemberDTO } = require("../models/classDTO.model");
const { v1: uuidv1 } = require("uuid");
const CryptoJS = require("crypto-js");
const ValidateService = require("../services/validate.service");
const JwtService = require("../services/jwt.service");
const jwtService = new JwtService();
const { sendEmail } = require("../helpers/class.helper");

/**
 * Get all user list
 */
const ListUser = async (req, res) => {
  let listUser = new Array();
  const list = await userModel.find({})

  return res
    .status(OK)
    .send({ data: list });
};

/**
 * Get all admin list
 */
 const ListAdmin = async (req, res) => {
  let listUser = new Array();
  const list = await adminModel.find({})

  return res
    .status(OK)
    .send({ data: list });
};

/**
 * Get all class list
 */
 const ListClass = async (req, res) => {
  let listUser = new Array();
  const list = await classModel.find({})

  return res
    .status(OK)
    .send({ data: list });
};

/**
 * Admin Register
 * @param username string
 * @param password string
 * @param email string
 * @param fullname string
 */
const adminRegister = async (req, res) => {
  let user = new Admin(req.body);

  let validate = new ValidateService(user);
  validate.required(["username", "password", "email", "fullname"]);
  validate.validateEmail();

  if (validate.hasError())
    return res
      .status(BAD_REQUEST)
      .send({ message: "Register failed", errors: validate.errors });

  // check username exists
  const userQuery = await adminModel.findOne({ username: user.username });
  if (!!userQuery) {
    return res.status(BAD_REQUEST).send({
      message: "Register failed",
      errors: { username: "Username already registered" },
    });
  }
  //check email exists
  const emailQuery = await adminModel.findOne({ email: user.email });
  //const unactiveEmailQuery = await adminModel.findOne({email: user.email+'&active'})
  if (!!emailQuery) {
    return res.status(BAD_REQUEST).send({
      message: "Register failed",
      errors: { username: "Email already registered" },
    });
  }

  user.id = uuidv1();
  user.password = CryptoJS.MD5(user.password).toString();
  user.createAt = new Date().toLocaleString();

  user = await adminModel.create(user);

  return res.status(OK).send({ message: "Register successfully" });

  // try {
  //   const m = user.email;
  //   user.email=user.email+'&active'
  //   await adminModel.create(user);

  //   const env = process.env.NODE_ENV || "dev";

  //   const uri =
  //    `${env == "dev" ? process.env.HOST_DEV : process.env.HOST_PRO}` +
  //     "/active/" +
  //     `${user.id}`;

  //   await sendEmail({email: m, content: `Active link: ${uri}`})

  //   return res.status(OK).send({ message: "Register successfully. Please check your email to active account" });
  // } catch (err) {
  //   console.log(err);
  //   return res.status(BAD_GATEWAY).send({ message: "OOps" });
  // }
};

/**
 * User login
 * @param username string
 * @param password string
 */

const adminLogin = async (req, res) => {
  let user = new Admin(req.body);
  let formValidate = new ValidateService(user);
  formValidate.required(["username", "password"]);
  if (formValidate.hasError())
    return res
      .status(BAD_REQUEST)
      .send({ message: "Login failed", errors: formValidate.errors });

  let userQuery = await adminModel.findOne({
    username: user.username,
    password: CryptoJS.MD5(user.password).toString(),
  });
  if (!userQuery)
    return res
      .status(BAD_REQUEST)
      .send({ message: "Username or password invalid" });

  userQuery = new Admin(userQuery._doc);
  userQuery.access_token = jwtService.generateJwt(userQuery);
  // console.log(userQuery)

  //check is activated account
  // const check = userQuery.email.split('&')
  // if(check[1] == 'active')
  // {
  //   const env = process.env.NODE_ENV || "dev";
  //   const uri =
  //    `${env == "dev" ? process.env.HOST_DEV : process.env.HOST_PRO}` +
  //     "/active/" +
  //     `${userQuery.id}`;

  //   await sendEmail({email: check[0], content: `Active link: ${uri}`})

  //   return res.status(BAD_REQUEST).send({message: "please check your email to active account"})
  // }

  try {
    await adminModel.updateOne({ id: userQuery.id }, userQuery);
    return res
      .status(OK)
      .send({ message: "Login successfully", data: userQuery });
  } catch (err) {
    console.log(err);
    return res.status(BAD_GATEWAY).send({ message: "OOps" });
  }
};

const activeAccount = async (req, res) => {
  const { id } = req.params;
  const user = await adminModel.findOne({ id: id });
  const email = user.email.split("&");
  await adminModel.updateOne({ id: id }, { email: email[0] });

  return res.status(OK).send({ message: "succeed" });
};

/**
 * User authenticate
 */
const authenticate = async (req, res) => {
  let authorization = req.headers.authorization;
  let accessToken = authorization.split(" ")[1].trim();
  let data = jwtService.verifyJwt(accessToken);
  // console.log(data)

  if (!data)
    return res.status(FORBIDDEN).send({ message: "Access token invalid" });

  let user = await adminModel.findOne({ id: data.id });
  return res.status(OK).send({ data: new Admin(user) });
};

/**
 * Get info user
 */
const adminInfo = async (req, res) => {
  let user = new Admin(req.user);
  let userQuery = await adminModel.findOne({ id: user.id });
  if (!userQuery)
    return res.status(BAD_REQUEST).send({ message: "Account not found" });
  return res.status(OK).send({ data: new Admin(req.user) });
};

/**
 * User logout
 */
const adminLogout = async (req, res) => {
  let user = new Admin(req.user);
  try {
    await adminModel.updateOne({ id: user.id }, { access_token: "" });
    return res.status(OK).send({ message: "Logout successfully" });
  } catch (err) {
    console.log(err);
    return res.status(BAD_GATEWAY).send({ message: "An error has occurred" });
  }
};

// update studentID
const updateStudentId = async (req, res) => {
  const { id } = req.user;
  const _student = await userModel.findOne({ studentId: req.body.studentId });

  if (_student != null) {
    return res.status(BAD_REQUEST).send({ message: "Student ID is taken" });
  }

  const student = await userModel.findOne({ id: id });
  if (!student.studentId) {
    await userModel.updateOne({ id: id }, { studentId: req.body.studentId });
    return res.status(OK).send({ message: "success" });
  }

  return res.status(BAD_REQUEST).send({ message: "Student ID existed" });
};

module.exports = {
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
};
