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
 * Get detail user
 */
 const DetailUser = async (req, res) => {
  const {userId} = req.params

  const info =  await userModel.findOne({ id: userId });

  let classMemberList = await classModel.find({ memberId: { $in: [userId] } });
  let classOwnerList = await classModel.find({ ownerId: userId });

  classMemberList = classMemberList.map((item) => new Class(item._doc));
  classOwnerList = classOwnerList.map((item) => new Class(item._doc));

  let classMemberDTO = await Promise.all(
    classMemberList.map(async (item) => {
      const classDTO = new ClassDTO(item);
      classDTO.member = await userModel.find({ id: { $in: item.memberId } });
      classDTO.member = classDTO.member.map((mem) => new MemberDTO(mem));

      classDTO.owner = await userModel.find({ id: { $in: item.ownerId } });
      classDTO.owner = classDTO.owner.map((mem) => new MemberDTO(mem));

      return classDTO;
    })
  );

  let classOwnerDTO = await Promise.all(
    classOwnerList.map(async (item) => {
      const classDTO = new ClassDTO(item);
      classDTO.member = await userModel.find({ id: { $in: item.memberId } });
      classDTO.member = classDTO.member.map((mem) => new MemberDTO(mem));
      classDTO.owner = await userModel.find({ id: { $in: item.ownerId } });
      classDTO.owner = classDTO.owner.map((mem) => new MemberDTO(mem));
      return classDTO;
    })
  );

  return res
    .status(OK)
    .send({ data: { info: info, classMember: classMemberDTO, classOwner: classOwnerDTO } });
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
 * Get detail class
 */
const DetailClass = async (req, res) => {
  const {classId} = req.params;
  try{
    const member = await classModel.findOne({id: classId});
    const owner = [];
    const student = [];

    for(let i = 0; i < member?.ownerId.length; i++){
      const data = await userModel.findOne({id: member?.ownerId[i]});
      owner.push({ id: member?.ownerId[i], fullname: data.fullname, username: data.username, email: data.email});
    }

    for(let i = 0; i < member?.memberId.length; i++){
      const data = await userModel.findOne({id: member?.memberId[i]});
      student.push({ id: member?.memberId[i], fullname: data.fullname, username: data.username, email: data.email});
    }

    return res.status(OK).send({data: {info: member, owner: owner, student: student}})
  }
  catch(e){
    return res.status(BAD_GATEWAY).send({ message: e?.message });
  
  }
}

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
  const newStudentId = req.body.studentId
  const oldStudent = req.body.user

  const student = await userModel.findOne({ id: oldStudent.id });

  if (student) {
    await userModel.updateOne({ id: oldStudent.id }, { studentId: newStudentId });

    const newStudent = await userModel.findOne({ id: oldStudent.id });
    return res.status(OK).send({ message: "Update student ID successfully", data: newStudent });
  }
  else{
    return res.status(BAD_GATEWAY).send({ message: "Update failed" });
  }
};

// update status
const updateStatus = async (req, res) => {
  const newStatus = req.body.status
  const oldStudent = req.body.user

  const student = await userModel.findOne({ id: oldStudent.id });

  if (student) {
    await userModel.updateOne({ id: oldStudent.id }, { status: newStatus });

    const newStudent = await userModel.findOne({ id: oldStudent.id });
    return res.status(OK).send({ message: "Update status successfully", data: newStudent });
  }
  else{
    return res.status(BAD_GATEWAY).send({ message: "Update failed" });
  }
};

/**
 * User authenticate
 */
 const authenticate = async (req, res) => {
  let authorization = req.headers.authorization;
  let accessToken = authorization.split(" ")[1].trim();
  let data = jwtService.verifyJwt(accessToken);

  if (!data)
    return res.status(FORBIDDEN).send({ message: "Access token invalid" });

  let user = await adminModel.findOne({ id: data.id });

  return res.status(OK).send({ data: new Admin(user) });
};

module.exports = {
  ListUser,
  ListAdmin,
  ListClass,
  adminRegister,
  adminLogin,
  adminLogout,
  updateStudentId,
  DetailUser,
  DetailClass,
  authenticate,
  updateStatus
};
