const { StatusCodes } = require("http-status-codes");
const { OK, FORBIDDEN, UNAUTHORIZED, BAD_REQUEST, BAD_GATEWAY } = StatusCodes;
const { v1: uuidv1 } = require("uuid");
const { gradeModel, Grade } = require("../models/grade.model");
const { User, userModel } = require("../models/user.model");
const { classModel } = require("../models/class.model");
const { reviewModel, Review } = require("../models/review.model");
const { commentModel } = require("../models/comment.model");
const ValidateService = require("../services/validate.service");
const {
  Notification,
  notificationModel,
} = require("../models/notification.model");

const markAsDoneAssignment_Code = 1;
const replyComment_Code = 2;
const requestReview_Code = 3;
const markAsDoneReview_Code = 4;

const markAsDoneAssignment = async ({ classId, assignmentId, senderId }) => {
  try {
    const _class = await classModel.findOne({ id: classId });
    const assignment = _class.assignments.find((ele) => {
      return ele.id == assignmentId;
    });

    const receivers = [];

    for (let i = 0; i < _class?.memberId.length; i++) {
      receivers.push({
        id: _class.memberId[i],
        isRead: false,
      });
    }

    const _notice = new Notification({
      id: uuidv1(),
      senders: senderId,
      notification: `${assignment.name} is done`,
      receivers: receivers,
      notificationCode: markAsDoneAssignment_Code,
    });

    await notificationModel.create(_notice);

    return receivers
  } catch (err) {
    throw err;
  }
};

const replyComment = async ({comment, senderId}) => {
    const receivers = []
    const _user = await userModel.findOne({id: senderId});

    if(comment.comments.length == 1){
        //if sender is a student
        if(comment.memberId == senderId){
            console.log(1);
            const _class = await classModel.findOne({id: comment.classId});
            for (let i = 0; i < _class?.ownerId.length; i++) {
                receivers.push({
                  id: _class.ownerId[i],
                  isRead: false,
                });
              }
        }
        else{
            console.log(2);
            receivers.push({
                id: comment.memberId,
                isRead: false,
            })
        }
        const id = uuidv1()
        const _notice = new Notification({
            id: id,
            senders: senderId,
            notification: `${_user?.fullname} comments on assignment`,
            receivers: receivers,
            notificationCode: replyComment_Code,
          });
          await notificationModel.create(_notice);

        return id;
    }
    else{
        let _notice = await notificationModel.findOne({id: comment.notificationId});
        //if sender is a student
        if(comment.memberId == senderId){
            const _class = await classModel.findOne({id: comment.classId});
            for (let i = 0; i < _class?.ownerId.length; i++) {
                receivers.push({
                  id: _class.ownerId[i],
                  isRead: false,
                });
              }

            
        }
        else{
            receivers.push({
                id: comment.memberId,
                isRead: false,
            })
        }
        await notificationModel.updateOne({id: comment.notificationId})
    }
};

const requestReview = async ({ classId, assignmentId, senderId }) => {
  try {
    const _class = await classModel.findOne({ id: classId });
    const assignment = _class.assignments.find((ele) => {
      return ele.id == assignmentId;
    });
    const _user = await userModel.findOne({ id: senderId });

    const receivers = [];

    for (let i = 0; i < _class?.ownerId.length; i++) {
      receivers.push({
        id: _class.ownerId[i],
        isRead: false,
      });
    }

    const _notice = new Notification({
      id: uuidv1(),
      senders: senderId,
      notification: `${_user.fullname} send a request review ${assignment.name}`,
      receivers: receivers,
      notificationCode: requestReview_Code,
    });

    await notificationModel.create(_notice);
    return receivers
  } catch (err) {
    throw err;
  }
};

const markAsDoneReview = async ({ reviewId, senderId }) => {
  const _review = await reviewModel.findOne({ id: reviewId });
  const _user = await userModel.findOne({ id: senderId });
  const _class = await classModel.findOne({ id: _review.classId });
  const assignment = _class.assignments.find((ele) => {
    return ele.id == _review.assignmentId;
  });
  
  const _notice = new Notification({
    id: uuidv1(),
    senders: senderId,
    notification: `${_user.fullname} mark ${assignment.name} done`,
    receivers: {
        id: _review.memberId,
        isRead: false,
      },
    notificationCode: markAsDoneReview_Code,
  });

  await notificationModel.create(_notice);
  return _review.memberId
};

const getNotification = async (req, res) => {
    const _notification = await notificationModel.find();
    const {id} = req.user;
    const notification = [];
    let notice = 0;

    for(let i = 0; i < _notification.length; i++){
        const receiver = _notification[i].receivers.find(ele => {return ele.id == id});
        if(!!receiver){
            if(receiver.isRead == false) {
                notice++;
            }
            notification.push({
                id: _notification[i].id,
                notification: _notification[i].notification,
                sender: _notification[i].sender,
                isRead: receiver.isRead,
                notificationCode: _notification[i].notificationCode
            })
        }
    }
    
    return res.status(OK).send({notification, notice})
}

const setNotification = async (req, res) => {
    const {notificationId} = req.params
    const {id} = req.user;
    const _notification = await notificationModel.findOne({id: notificationId});
    const index = _notification.receivers.findIndex(ele => {return ele.id == id})
    _notification.receivers[index].isRead = true;
    await notificationModel.updateOne({id: notificationId}, {receivers: _notification.receivers})

    return res.status(OK).send({message: 'succeed'});
}

module.exports = {
  markAsDoneAssignment,
  replyComment,
  requestReview,
  markAsDoneReview,
  getNotification,
  setNotification,
};
