const { StatusCodes } = require("http-status-codes");
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes;
const { Class, classModel } = require("../models/class.model");
const { v1: uuidv1 } = require("uuid");
const CryptoJS = require("crypto-js");
const ValidateService = require("../services/validate.service");
const JwtService = require("../services/jwt.service");
const jwtService = new JwtService();
const ShortUniqueId = require("short-unique-id");
const { User, userModel } = require("../models/user.model");
const { ClassDTO, MemberDTO } = require("../models/classDTO.model");
const {
  sendEmail,
  isMemberClass,
  isOwnerClass,
} = require("../helpers/class.helper");
const { Assignment } = require("../models/assignment.model");
const shortCode = new ShortUniqueId({ length: 7 });
const config = require("dotenv");
const { writeXlsxFile, readXlsxFile } = require("../helpers/xlsx.helpers");
const { gradeModel } = require("../models/grade.model");
const { getTotalGrade } = require("../controllers/grade.controller");
config.config();

/**
 * Create class
 * @param name string
 * @param description string
 */
const createClass = async (req, res) => {
  let user = new User(req.user);
  // console.log("user: ", user)
  let class_ = new Class(req.body);
  class_.memberId = [];
  class_.id = uuidv1();
  class_.code = shortCode();
  class_.ownerId = [user.id];

  let validate = new ValidateService(class_);
  validate.required(["name", "description"]);

  if (validate.hasError())
    return res
      .status(BAD_REQUEST)
      .send({ message: "Create failed", error: validate.errors });

  try {
    user.classIdOwner.push(class_.id);
    await classModel.create(class_);
    await userModel.updateOne(
      { id: user.id },
      { classIdOwner: user.classIdOwner }
    );
    return res
      .status(OK)
      .send({ message: "Create successfully", data: class_ });
  } catch (err) {
    return res.status(BAD_REQUEST).send({ message: "Create failed" });
  }
};

/**
 * Update class
 * @param classId string
 * @param name string
 * @param description string
 */
const updateClass = async (req, res) => {
  let user = new User(req.user);

  let classUpdate = new Class(req.body);
  classUpdate.id = req.body.classId;

  let validate = new ValidateService(classUpdate);
  validate.required(["name", "description", "id"]);

  if (validate.hasError())
    return res
      .status(BAD_REQUEST)
      .send({ message: "Update failed", error: validate.errors });

  try {
    if (user.classIdOwner.indexOf(classUpdate.id) < 0)
      return res.status(FORBIDDEN).send({ message: "You not permission" });

    // console.log("classUpdate: ", classUpdate)
    await classModel.updateOne(
      { id: classUpdate.id },
      {
        name: classUpdate.name,
        description: classUpdate.description,
      }
    );

    return res
      .status(OK)
      .send({ message: "Update successfully", data: classUpdate });
  } catch (err) {
    console.log(err);
    return res.status(BAD_GATEWAY).send({ message: "Update failed" });
  }
};

/**
 * Delete class by ID
 * @param classId string
 */
const deleteClass = async (req, res) => {
  let user = new User(req.user);
  if (!req.body.classId)
    return res.status(BAD_REQUEST).send({ message: "Id invalid" });

  if (user.classIdOwner.indexOf(req.body.classId) < 0)
    return res.status(FORBIDDEN).send({ message: "You not permission" });

  try {
    user.classIdOwner = user.classIdOwner.filter(
      (id) => id != req.body.classId
    );
    await userModel.updateOne(
      { id: user.id },
      { classIdOwner: user.classIdOwner }
    );
    await classModel.deleteOne({ id: req.body.classId });
    return res.status(OK).send({ message: "Delete successfully" });
  } catch (err) {
    console.log(err);
    return res.status(BAD_GATEWAY).send({ message: "Delete failed" });
  }
};

/**
 * Get info all my class
 */
const getClass = async (req, res) => {
  let user = new User(req.user);

  let classMemberList = await classModel.find({ memberId: { $in: [user.id] } });
  let classOwnerList = await classModel.find({ ownerId: user.id });

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
    .send({ data: { classMember: classMemberDTO, classOwner: classOwnerDTO } });
};

const getClassByID = async (req, res) => {
  const idClass = req.params.id;
  let classroomQuery = await classModel.findOne({ id: idClass });
  if (!classroomQuery)
    return res.status(BAD_REQUEST).send({ message: "classroom not found" });
  return res.status(OK).send({
    message: "Get class successfully",
    data: new Class(classroomQuery),
  });
};

/**
 * Invite user join to class
 * @param email string
 * @param classId string
 * @param role string
 */
const inviteClass = async (req, res) => {
  let data = {
    email: req.body.email,
    classId: req.body.classId,
    role: req.body.role,
    userId: null,
  };

  let dataValidate = new ValidateService(data);
  dataValidate.required(["email", "classId", "role"]);

  // console.log(data)
  if (data.role != "owner" && data.role != "member")
    return res.status(OK).send({ message: "Role must a OWNER or MEMBER" });

  let userQuery = await userModel.findOne({ email: data.email });
  if (!!userQuery) data.userId = userQuery.id;

  console.log(process.env.NODE_ENV);
  const inviteToken = jwtService.generateInviteToken(data);
  const env = process.env.NODE_ENV || "dev";
  const contentInvite =
    "Link invite:" +
    `${env == "dev" ? process.env.HOST_DEV : process.env.HOST_PRO}` +
    "/confirm-invite/" +
    `${inviteToken}`;

  let classes = await classModel.findOne({ id: data.classId });
  classes = new Class(classes._doc);
  classes.inviteToken.push(inviteToken);
  await classModel.updateOne(
    { id: classes.id },
    { inviteToken: classes.inviteToken }
  );

  await sendEmail({ email: data.email, content: contentInvite });

  return res.status(OK).send({ message: "Sent link invite to email" });
};

/**
 * Verify invite token join class
 * @param inviteToken string
 */
const verifyInviteClass = async (req, res) => {
  let inviteToken = req.body.inviteToken;
  let data = jwtService.verifyJwt(inviteToken);
  console.log("data invite token: ", data);
  if (!data)
    return res.status(UNAUTHORIZED).send({ message: "Invite token invalid" });

  let userQuery = await userModel.findOne({ email: data.email });
  if (!userQuery)
    return res.status(BAD_REQUEST).send({
      message: "Verify invite token failed",
      errors: { email: ["Email is not register account"] },
    });

  let classes = await classModel.findOne({ id: data.classId });
  classes = new Class(classes._doc);

  if (classes.inviteToken.indexOf(inviteToken) < 0)
    return res.status(BAD_REQUEST).send({
      message: "User join class failed",
      errors: { inviteToken: ["Invite token not exists"] },
    });

  classes.inviteToken = classes.inviteToken.filter(
    (token) => token != inviteToken
  );
  // console.log(classes)

  if (data.role == "member")
    classes.memberId = [...classes.memberId, userQuery.id];
  else if (data.role == "owner")
    classes.ownerId = [...classes.ownerId, userQuery.id];

  // console.log(classes)

  await classModel.updateOne(
    { id: classes.id },
    { memberId: classes.memberId, inviteToken: classes.inviteToken }
  );

  return res.status(OK).send({ message: "User join class successfully" });
};

const joinClass = async (req, res) => {
  const user = new User(req.user);
  const { code } = req.query;

  let class_ = await classModel.findOne({ code });
  if (!class_)
    return res.status(BAD_REQUEST).send({ message: "Code is not exists" });

  // check user is exists in class
  class_ = new Class(class_._doc);

  if (!isMemberClass(user.id, class_.id) || !isOwnerClass(user.id, class_.id)) {
    return res.status(OK).send({ message: "User already exists in class" });
  } else {
    class_.memberId = [...class_.memberId, user.id];
    await classModel.updateOne(
      { id: class_.id },
      { memberId: class_.memberId }
    );
    return res.status(OK).send({ message: "User join class successfully" });
  }
};

const updateAssignment = async (req, res) => {
  let user = new User(req.user);
  const data = {
    classId: req.body.classId,
    assignments: req.body.assignments,
  };

  let dataValidate = new ValidateService(data);
  dataValidate.required(["classId", "assignments"]);

  if (dataValidate.hasError())
    return res.status(BAD_REQUEST).send({
      message: "Update assignment failed",
      error: dataValidate.errors,
    });

  if (!isOwnerClass(user.id, data.classId)) {
    return res.status(UNAUTHORIZED).send({ message: "You not permission" });
  }

  data.assignments = data.assignments.map((ass) => new Assignment(ass));
  let class_ = await classModel.findOne({ id: data.classId });
  let classObj = new Class(class_._doc);
  classObj.assignments = data.assignments;

  // console.log(classObj)

  await classModel.updateOne({ id: data.classId }, classObj);

  return res.status(OK).send({ message: "Update assignment successfully" });
};

const exportStudentList = async (req, res) => {
  const { classId } = req.params;
  const _class = await classModel.findOne({ id: classId });
  const students = [];

  for (let i = 0; i < _class.memberId.length; i++) {
    const student = await userModel.findOne({ id: _class.memberId[i] });
    students.push({ studentId: student.studentId, fullname: student.fullname });
  }

  writeXlsxFile("studentList", students);

  return res.status(OK).download("./xlsxFolder/studentList.xlsx");
};

const importStudentList = async (req, res) => {
  const file = req.file;
  const { classId } = req.params;

  const studentList = readXlsxFile(file.filename);

  const _class = await classModel.findOne({ id: classId });
  const students = [];
  console.log(studentList);
  for (let i = 0; i < _class.memberId.length; i++) {
    const student = await userModel.findOne({ id: _class.memberId[i] });
    students.push({id: student.id, studentId: student.studentId, fullname: student.fullname });
  }
  console.log(students);
  for (let i = 0; i < studentList.length; i++) {
    let isInClass = false;
    for (let j = 0; i < students.length; j++) {
      if (studentList[i].studentId == students[j]?.studentId) {
        isInClass = true;
        break;
      }
      if (!students[j]?.studentId) {
        isInClass = true;
        break;
      }
    }

    if (!isInClass) {
      const student = await userModel.findOne({
        studentId: studentList[i].studentId,
      });
      student.classIdMember.push(_class.id);
      await userModel.updateOne(
        { studentId: studentList[i].studentId },
        { classIdMember: student.classIdMember }
      );
      _class.memberId.push(student.id);
      await classModel.updateOne(
        { id: _class.id },
        { memberId: _class.memberId }
      );
    }
  }

  return res.send({ message: _class.memberId });
};

const getGradeList = async (req, res) => {
  const { classId } = req.params;
  const _class = await classModel.findOne({ id: classId });
  const datas = [];
  const assignments = [];
  _class.assignments.forEach((e) => {
    assignments.push({ id: e.id, name: e.name, max: e.scoreRate, isDone: e.isDone });
  });

  for (let i = 0; i < _class.memberId.length; i++) {
    const student = await userModel.findOne({ id: _class.memberId[i] });
    let grades = [];
    const grade = await gradeModel.findOne({
      classId: classId,
      memberId: student.id,
    });

    for (let j = 0; j < _class.assignments.length; j++) {
      const assignment = grade?.assignments.find((item) => {
        if (item.id == _class.assignments[j].id) {
          return item;
        }
      });
      grades.push({ point: assignment?.grade, id: _class.assignments[j].id });
    }

    datas.push({
      id: student.id,
      studentId: student?.studentId,
      fullname: student.fullname,
      total: await getTotalGrade({classId: classId, memberId: _class.memberId[i]}),
      grades: grades,
    });
  }

  return res.send({
    message: "successed",
    assignments: assignments,
    data: datas,
  });
};

const downloadGrade = async (req, res) => {
  const { classId } = req.params;
  const _class = await classModel.findOne({ id: classId });

  const _student = [];
  for (let i = 0; i < _class.memberId.length; i++) {
    const objAss = {};
    const s = await userModel.findOne({ id: _class.memberId[i] });
    const g = await gradeModel.findOne({
      classId: classId,
      memberId: _class.memberId[i],
    });
    for (let j = 0; j < _class.assignments.length; j++) {
      const idx = g?.assignments.findIndex((e) => {
        return e.id === _class.assignments[j].id;
      });
      objAss[_class.assignments[j].name] =
        g?.assignments[idx]?.grade == undefined ? 0 : g.assignments[idx].grade;
    }
    objAss['total'] = await getTotalGrade({classId: classId, memberId: _class.memberId[i]});
    _student.push({...{name: s.fullname}, ...objAss});
  }

  writeXlsxFile("studentList", _student);

  return res.status(OK).download("./xlsxFolder/studentList.xlsx");
};

module.exports = {
  getClass,
  createClass,
  getClassByID,
  updateClass,
  deleteClass,
  inviteClass,
  verifyInviteClass,
  joinClass,
  updateAssignment,
  exportStudentList,
  importStudentList,
  getGradeList,
  downloadGrade,
};
