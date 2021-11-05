const mongoose = require('mongoose');

class User {
    constructor({
        id,
        username,
        password,
        fullname,
        email,
        access_token
    }) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.email = email;
        this.access_token = access_token;
    }
}

const userSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    fullname: String,
    email: String,
    access_token: String,
});

const userModel = mongoose.model('user', userSchema);

module.exports = {
    User,
    userModel
}