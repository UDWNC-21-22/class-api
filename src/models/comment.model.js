const mongoose = require('mongoose');

class Comment {
    constructor({
        id=null,
        memberId=null,
        assignmentId=null,
        comments=[],
        classId=null,
    }) {
        this.id = id;
        this.memberId=memberId;
        this.assignmentId=assignmentId;
        this.comments=comments;
        this.classId=classId;
    }
}

const commentSchema = new mongoose.Schema({
    id: String,
    memberId: String,
    assignmentId: String,
    comments: Array,
    classId: String,
});

const commentModel = mongoose.model('comment', commentSchema);

module.exports = {
    Comment,
    commentModel
}