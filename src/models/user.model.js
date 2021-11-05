class User{
    constructor({
        id,
        username,
        password,
        fullname,
        email,
        access_token
    }){
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullname = fullname;
        this.email = email;
        this.access_token = access_token;
    }
}


module.exports = {
    User
}