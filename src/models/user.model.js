const mongoose = require('mongoose');

class User {
    constructor({
        id=null,
        username=null,
        password=null,
        fullname=null,
        email=null,
        classIdOwner=[],
        classIdMember=[],
        access_token=null,
        studentId=null,
        createAt=null
    }) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.email = email;
        this.classIdMember = classIdMember;
        this.classIdOwner = classIdOwner;
        this.access_token = access_token;
        this.studentId = studentId;
        this.createAt = createAt;
    }
}

const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    fullname: String,
    email: String,
    classIdOwner: [String],
    classIdMember: [String],
    access_token: String,
    studentId: String,
    createAt: String,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
    User,
    userModel
}