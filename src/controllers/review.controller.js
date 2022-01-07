const { StatusCodes } = require("http-status-codes");
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes;
const { v1: uuidv1 } = require("uuid");
const { gradeModel, Grade } = require("../models/grade.model");
const { User, userModel } = require("../models/user.model");
const { classModel } = require("../models/class.model");
const { reviewModel, Review } = require("../models/review.model");
const { commentModel } = require("../models/comment.model");
const ValidateService = require("../services/validate.service");
const { requestReview, markAsDoneReview } = require("./notification.controller");

const postReview = async (req, res) => {
  const { classId, assignmentId } = req.params;
  const {id} = req.user;
  const {expectationGrade, explainMessage} = req.body;
  const _review = await reviewModel.findOne({
    memberId: id,
    classId: classId,
    assignmentId: assignmentId,
  });
  if (_review) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "The assignment has been reviewed" });
  }
  const newReview = new Review({
    id: uuidv1(),
    memberId: id,
    assignmentId: assignmentId,
    expectationGrade: expectationGrade,
    explainMessage: explainMessage,
    classId: classId,
  });
  await reviewModel.create(newReview);
  await requestReview({classId: classId, assignmentId: assignmentId, senderId: id})
  return res.status(OK).send({ message: "succeed" });
};

/**
 * List of review student, scoreRate, current, expertation grade, explain, comment
 * @param {*} req 
 * @param {*} res 
 */
const getReview = async (req, res) => {
  const { studentId, classId } = req.params;
  const _review = await reviewModel.find({classId: classId, memberId: studentId});
  const _class = await classModel.findOne({id: classId});
  const _grade = await gradeModel.findOne({memberId: studentId, classId: classId});
  const _user = await userModel.findOne({id: studentId})

  const response = []
  for(let i = 0; i < _review.length; i++){
    const data = {};
    const tempClass = _class.assignments.find(ele => {return ele.id == _review[i].assignmentId})
    data['reviewId'] = _review[i].id;
    data['assignment'] = {id: tempClass.id, name: tempClass.name}
    data['scoreRate'] = tempClass.scoreRate;
    data['currentGrade'] = _grade.assignments.find(ele => {return ele.id == _review[i].assignmentId}).grade;
    data['expertationGrade'] = _review[i].expectationGrade;
    data['explainMessage'] = _review[i].explainMessage;
    response.push(data);
  }


  return res.status(OK).send({ fullname: _user.fullname, review: response });
};

const markAsDone = async (req, res) => {
    const {reviewId} = req.params
    const {id} = req.user;
    await reviewModel.updateOne({id: reviewId}, {isDone: true})
  await markAsDoneReview({reviewId: reviewId, senderId: id});
    return res.status(OK).send({message: 'succeed'})
}

module.exports = {
  postReview,
  getReview,
  markAsDone
};
