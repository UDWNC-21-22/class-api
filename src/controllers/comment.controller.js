const { StatusCodes } = require("http-status-codes");
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes;
const { v1: uuidv1 } = require("uuid");
const { gradeModel, Grade } = require("../models/grade.model");
const { User, userModel } = require("../models/user.model");
const { classModel } = require("../models/class.model");
const { commentModel, Comment } = require("../models/comment.model");
const { reviewModel, Review } = require("../models/review.model");
const ValidateService = require("../services/validate.service");
const { replyComment } = require("./notification.controller");

const postComment = async (req, res) => {
  const { classId, assignmentId } = req.params;
  const { id } = req.user;
  const { comment, studentId } = req.body;
  const _class = await classModel.findOne({ id: classId });
  let _comment;
  let role;
  let ownerId;
  if (_class?.memberId.includes(id)) {
    ownerId = id;
    role = "student";
  } else {
    ownerId = studentId;
    role = "teacher";
  }

  _comment = await commentModel.findOne({
    classId: classId,
    assignmentId: assignmentId,
    memberId: ownerId,
  });

  if (!_comment) {
    const _comment = new Comment({
      id: uuidv1(),
      memberId: ownerId,
      assignmentId: assignmentId,
      classId: classId,
    });
    _comment.comments.push({ role: role, comment: comment });
    const _noticeId = await replyComment({comment: _comment, senderId: role == "teacher"?id: studentId});
    _comment.notificationId=_noticeId
    await commentModel.create(_comment);
  } else {
    _comment.comments.push({ role: role, comment: comment });
    await commentModel.updateOne(
      {
        memberId: ownerId,
        classId: classId,
        assignmentId: assignmentId,
      },
      { comments: _comment.comments }
    );
    await replyComment({comment: _comment, senderId: ownerId});
  }
  
  return res.status(OK).send({ message: _comment });
};

const getComment = async (req, res) => {
  const { classId, assignmentId, studentId } = req.params;
  const _comment = await commentModel.findOne({
    classId: classId,
    assignmentId: assignmentId,
    memberId: studentId,
  });
  if (_comment) {
    return res.status(OK).send(_comment);
  } else {
    return res.status(OK).send([]);
  }
};

module.exports = {
  postComment,
  getComment,
};
