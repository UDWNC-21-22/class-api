const mongoose = require('mongoose');

class Grade {
    constructor({
        id=null,
        memberId=null,
        classId=null,
        grade=null,
        assignments = []
    }) {
        this.id = id;
        this.memberId = memberId;
        this.classId = classId;
        this.grade = grade;
        this.assignments = assignments;
    }
}

const gradeSchema = new mongoose.Schema({
    id: String,
    memberId: String,
    classId: String,
    grade: String,
    assignments: [{
        id: String,
        name: String,
        grade: Number
    }]
});

const gradeModel = mongoose.model('grade', gradeSchema);

module.exports = {
    Grade,
    gradeModel
}