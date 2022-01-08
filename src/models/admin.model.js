const mongoose = require('mongoose');

class Admin {
    constructor({
        id=null,
        username=null,
        password=null,
        fullname=null,
        email=null,
        access_token=null,
        createAt=null
    }) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.email = email;
        this.access_token = access_token;
        this.createAt = createAt;
    }
}

const adminSchema = new mongoose.Schema({
    id: String,
    username: String,
    password: String,
    fullname: String,
    email: String,
    access_token: String,
    createAt: String,
});

const adminModel = mongoose.model('admin', adminSchema);

module.exports = {
    Admin,
    adminModel
}