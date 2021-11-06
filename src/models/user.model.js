const mongoose = require('mongoose');

class User {
    constructor({
        id,
        username,
        password,
        fullname,
        email,
        role,
        access_token
    }) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.email = email;
        if (role != 'teacher' && role != 'student') {
            this.role = null;
        }
        else this.role = role;

        this.access_token = access_token;
    }
}

const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    fullname: String,
    email: String,
    role: String,
    access_token: String,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
    User,
    userModel
}