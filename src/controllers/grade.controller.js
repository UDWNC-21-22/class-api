const { StatusCodes } = require("http-status-codes");
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes;
const { v1: uuidv1 } = require("uuid");
const ValidateService = require("../services/validate.service");
const ShortUniqueId = require("short-unique-id");
const { gradeModel, Grade } = require("../models/grade.model");
const { User, userModel } = require("../models/user.model");
const { isOwnerClass, isMemberClass } = require("../helpers/class.helper");
const { classModel } = require("../models/class.model");
const {
  GradeDTO,
  MemberGradeDTO,
  ClassGradeDTO,
} = require("../models/gradeDTO.model");
const { writeXlsxFile, readXlsxFile } = require("../helpers/xlsx.helpers");

/**
 * Get all grade student of class
 * @param classId string
 */
const getGradeByClass = async (req, res) => {
  const user = new User(req.user);
  const classId = req.params.id;

  if (!isOwnerClass(user.id, classId) || !isMemberClass(user.id, classId)) {
    return res.status(UNAUTHORIZED).send({ message: "You not permission" });
  }

  var grades = await gradeModel.find({ classId });

  grades = await Promise.all(
    grades.map(async (g) => {
      let gradeDTO = new GradeDTO({});
      gradeDTO.id = g.id;

      gradeDTO.member = await userModel.findOne({ id: g.memberId });
      gradeDTO.member = new MemberGradeDTO(gradeDTO.member._doc);

      gradeDTO.classes = await classModel.findOne({ id: g.classId });
      gradeDTO.classes = new ClassGradeDTO(gradeDTO.classes._doc);

      gradeDTO.grade = g.grade;
      return gradeDTO;
    })
  );

  return res.status(OK).send({ data: grades });
};

const getGradeByUser = async (req, res) => {
  const user = new User(req.user);
  const userGrades = await gradeModel.find({ memberId: user.id });
  var grades = [];

  // console.log(userClasses)

  // for(let i = 0; i<userClasses.length; i++){
  //     const c = await classModel.find({id: userClasses[i].classId});
  //     console.log('lop', c);
  //     className.push({
  //         class: c.name,
  //         grade: userClasses[i].grade
  //     })
  // }

  grades = await Promise.all(
    userGrades.map(async (g) => {
      let gradeDTO = new GradeDTO({});
      gradeDTO.id = g.id;

      gradeDTO.member = await userModel.findOne({ id: g.memberId });
      gradeDTO.member = new MemberGradeDTO(gradeDTO.member._doc);

      gradeDTO.classes = await classModel.findOne({ id: g.classId });
      gradeDTO.classes = new ClassGradeDTO(gradeDTO.classes._doc);

      gradeDTO.grade = g.grade;
      return gradeDTO;
    })
  );

  console.log(grades);

  return res.status(OK).send({ data: grades });
};

/**
 * Create/Update grade student of class by ID
 * @param memberId string
 * @param classId string
 * @param grade number
 */
const postGrade = async (req, res) => {
  const user = new User(req.user);
  let gradeStudent = new Grade(req.body);

  let gradeValidate = new ValidateService(gradeStudent);
  gradeValidate.required(["memberId", "classId", "grade"]);

  if (gradeValidate.hasError())
    return res
      .status(BAD_REQUEST)
      .send({ message: "Post grade failed", errors: gradeValidate.errors });

  if (!(await isOwnerClass(user.id, gradeStudent.classId))) {
    return res.status(UNAUTHORIZED).send({ message: "You not permission" });
  }

  try {
    let gradeQuery = await gradeModel.findOne({
      memberId: gradeStudent.memberId,
      classId: gradeStudent.classId,
    });
    if (!gradeQuery) {
      // create grade
      console.log("create grade");
      gradeStudent.id = uuidv1();
      await gradeModel.create(gradeStudent);
    } else {
      // update grade
      console.log("update grade");
      gradeStudent.id = gradeQuery.id;
      await gradeModel.updateOne(
        { memberId: gradeStudent.memberId, classId: gradeStudent.classId },
        gradeStudent
      );
    }

    return res.status(OK).send({ message: "Post grade successfully" });
  } catch (e) {
    console.log(e);
    return res.status(BAD_GATEWAY).send({ message: "Post grade failed" });
  }
};

const exportGradeList = async (req, res) => {
  const { classId } = req.params;
  const _class = await classModel.findOne({ id: classId });

  const students = [];

  for (let i = 0; i < _class.memberId.length; i++) {
    const student = await userModel.findOne({ id: _class.memberId[i] });
    students.push({ studentId: student.studentId, grade: "" });
  }

  writeXlsxFile("gradeList", students);
  return res.status(OK).download("./xlsxFolder/gradeList.xlsx");
};

const importGradeList = async (req, res) => {
  const file = req.file;

  const { classId, assignmentId } = req.params;
  const _class = await classModel.findOne({ id: classId });
  const studentList = readXlsxFile(file.filename);

  studentList.forEach(async (e) => {
    const student = await userModel.findOne({ studentId: e.studentId });
    const assignment = await gradeModel.findOne({
      memberId: student.id,
      classId: classId,
    });
    const ass = _class.assignments.find((a) => a.id == assignmentId);
    assignment?.assignments.push({
      id: assignmentId,
      name: ass.name,
      grade: e.grade,
    });
    await gradeModel.updateOne(
      { id: assignment.id },
      { assignments: assignment.assignments,
      grade: assignment.grade + e.grade * ass.scoreRate / 10 }
    );
  });

  return res.send({ message: "success" });
};

const updateGrade = async (req, res) => {
  const { classId, assignmentId, studentId } = req.params;

  let grade = await gradeModel.findOne({
    classId: classId,
    memberId: studentId,
  });
  const _class = await classModel.findOne({ id: classId });
  const g = _class.assignments.find((item) => {
    if (item.id == assignmentId) return item;
  });

  if (!grade) {
    const newGrade = new Grade({
      id: uuidv1(),
      memberId: studentId,
      classId: classId,
      grade: (req.body.grade * g.scoreRate) / 10,
      assignments: [],
    });
    newGrade.assignments.push({
      id: g.id,
      name: g.name,
      grade: req.body.grade,
    });
    await gradeModel.create(newGrade);
  } else {
    //if
    const index = grade.assignments.findIndex((item) => {
      if (item.id == assignmentId) return item;
    });
    if (index == -1) {
      grade.assignments.push({
        id: assignmentId,
        name: g.name,
        grade: req.body.grade,
      });
      await gradeModel.updateOne(
        { classId: classId, memberId: studentId },
        {
          assignments: grade.assignments,
          grade: grade.grade + (req.body.grade * g.scoreRate) / 10,
        }
      );
    } else {
      const oldGrade = grade.assignments[index].grade;
      grade.assignments[index].grade = req.body.grade;
      const newTotal = Math.round((grade.grade - (oldGrade * g.scoreRate) / 10 + (req.body.grade * g.scoreRate) / 10) * 100) / 100;
      await gradeModel.updateOne(
        { classId: classId, memberId: studentId },
        {
          assignments: grade.assignments,
          grade: newTotal,
        }
      );
    }
  }

  return res.send({ message: "succeess" });
};

const getTotalGrade = async ({classId, memberId}) => {
  const _class = await classModel.findOne({id: classId});
  const _grade = await gradeModel.findOne({classId: classId, memberId: memberId})

  if(!_grade) {
    return 0;
  }
  else{
    if(!_grade.assignments){
      return 0;
    }
    else{
      let total = 0
      _grade.assignments.forEach((element) => {
        const scoreRate = _class.assignments.find((data) => {return data.id == element.id}).scoreRate;
        total += element.grade * scoreRate / 10;
      })

      return total;
    }
  }
};

const updateIsDone = async (req, res) => {
  const { classId, assignmentId } = req.params;
  const _class = await classModel.findOne({ id: classId });
  const index = _class.assignments.findIndex(
    (element) => element.id == assignmentId
  );

  _class.assignments[index].isDone = true;
  await classModel.updateOne(
    { id: classId },
    { assignments: _class.assignments }
  );
  return res.send({ message: "successed" });
};

const getStudentGrade = async (req, res) => {
  const {id} = req.user;
  const {classId} = req.params 
  const _class = await classModel.findOne({id: classId});
  const _user = await userModel.findOne({id: id})
  const _grade = await gradeModel.findOne({classId: classId, memberId: id})
  const grades = [];
  let total = 0;

  for(let i = 0; i < _class?.assignments.length; i++){
    if(_class?.assignments[i].isDone == true) {
      const g = _grade?.assignments.find((ele) => {return ele.id == _class?.assignments[i].id})
      total = total + (g?.grade * _class?.assignments[i].scoreRate / 10)
      grades.push({id: g?.id, name: g?.name, grade: g?.grade})
    }
  }

  return res.status(OK).send({id: _user.id, fullname: _user.fullname, grades: grades, total: total});
}

module.exports = {
  postGrade,
  getGradeByClass,
  getGradeByUser,
  exportGradeList,
  importGradeList,
  updateGrade,
  getTotalGrade,
  updateIsDone,
  getStudentGrade,
};
