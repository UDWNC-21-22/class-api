const mongoose = require('mongoose');

class Grade {
    constructor({
        id=null,
        studentId=null,
        classId=null,
        grade=null,
    }) {
        this.id = id;
        this.studentId = studentId;
        this.classId = classId;
        this.grade = grade;
    }
}

const gradeSchema = new mongoose.Schema({
    id: String,
    studentId: String,
    classId: String,
    grade: String
});

const gradeModel = mongoose.model('grade', classSchema);

module.exports = {
    Grade,
    gradeModel
}