const mongoose = require('mongoose');

class Review {
    constructor({
        id=null,
        memberId=null,
        assignmentId=null,
        expectationGrade=null,
        explainMessage=null,
        classId=null,
        isDone=false,
    }) {
        this.id = id;
        this.memberId=memberId;
        this.assignmentId=assignmentId;
        this.expectationGrade=expectationGrade;
        this.explainMessage=explainMessage;
        this.classId=classId;
        this.isDone=isDone;
    }
}

const reviewSchema = new mongoose.Schema({
    id: String,
    memberId: String,
    assignmentId: String,
    expectationGrade: Number,
    explainMessage: String,
    classId: String,
    isDone: Boolean,
});

const reviewModel = mongoose.model('review', reviewSchema);

module.exports = {
    Review,
    reviewModel
}