const mongoose = require('mongoose');

class Grade {
    constructor({
        id=null,
        memberId=null,
        classId=null,
        grade=null,
    }) {
        this.id = id;
        this.memberId = memberId;
        this.classId = classId;
        this.grade = grade;
    }
}

const gradeSchema = new mongoose.Schema({
    id: String,
    memberId: String,
    classId: String,
    grade: String
});

const gradeModel = mongoose.model('grade', gradeSchema);

module.exports = {
    Grade,
    gradeModel
}