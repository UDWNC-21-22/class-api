const { StatusCodes } = require('http-status-codes')
const { OK, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY } = StatusCodes
const { validateEmail } = require('../helpers/form.helper')
const { User, userModel } = require('../models/user.model')
const { v1: uuidv1 } = require('uuid');
const CryptoJS = require("crypto-js");
const ValidateService = require('../services/validate.service')
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()


const userList = (req, res) => {
    const data = [
        {
            user: 'user 1',
            emai: 'email 1'
        },
        {
            user: 'user 2',
            emai: 'email 2'
        }
    ]

    return res.status(200).send({ data })
}


/**
 * User Register
 * @param username string 
 * @param password string 
 * @param email string 
 * @param fullname string 
 */
const userRegister = async (req, res) => {

    let user = new User(req.body)

    let validate = new ValidateService(user)
    validate.required(['username', 'password', 'email', 'fullname'])
    validate.validateEmail()

    if (validate.hasError())
        return res.status(BAD_REQUEST).send({ message: "Regsiter failed", errors: validate.errors })

    // check username exists
    const userQuery = await userModel.findOne({ username: user.username })
    if (!!userQuery) {
        return res.status(BAD_REQUEST).send({ message: 'Register failed', errors: { username: 'Username already registered' } })
    }


    user.id = uuidv1();
    user.password = CryptoJS.MD5(user.password).toString()

    // console.log(user)
    try {
        await userModel.create(user)
        return res.status(OK).send({ message: "Register successfully" })
    }
    catch (err) {
        console.log(err)
        return res.status(BAD_GATEWAY).send({ message: "OOps" })
    }

}


/**
 * User login
 * @param username string
 * @param password string
 */

const userLogin = async (req, res) => {
    let user = new User(req.body);
    let formValidate = new ValidateService(user);
    formValidate.required(['username', 'password'])
    if (formValidate.hasError())
        return res.status(BAD_REQUEST).send({ message: 'Login failed', errors: formValidate.errors })

    let userQuery = await userModel.findOne({ username: user.username, password: CryptoJS.MD5(user.password).toString() })
    if (!userQuery)
        return res.status(BAD_REQUEST).send({ message: 'Username or password invalid' })



    userQuery = new User(userQuery._doc)
    userQuery.access_token = jwtService.generateJwt(userQuery)
    // console.log(userQuery)

    try {
        await userModel.updateOne({ id: userQuery.id }, userQuery)
        return res.status(OK).send({ message: 'Login successfully', data: userQuery })
    }
    catch (err) {
        console.log(err);
        return res.status(BAD_GATEWAY).send({ message: "OOps" })
    }

}


/**
 * User authenticate
 */

const authenticate = async (req, res) => {
    let authorization = req.headers.authorization;
    let accessToken = authorization.split(" ")[1].trim();
    let data = jwtService.verifyJwt(accessToken)
    // console.log(data)

    if (!data)
        return res.status(FORBIDDEN).send({ message: 'Access token invalid' })

    let user = await userModel.findOne({ id: data.id })

    // console.log(user)

    return res.status(OK).send({ data: new User(user) })

}


/**
 * Get info user
 */
const userInfo = async (req, res) => {
    let user = new User(req.user)
    let userQuery = await userModel.findOne({id: user.id})
    if (!userQuery) return res.status(BAD_REQUEST).send({ message: 'User not found' })
    return res.status(OK).send({ data: new User(req.user) })
}

/**
 * User logout
 */
const userLogout = async (req, res) => {
    let user = new User(req.user)
    try{
        await userModel.updateOne({id: user.id}, {access_token: ''})
        return res.status(OK).send({message: 'Logout successfully'})
    }
    catch(err){
        console.log(err)
        return res.status(BAD_GATEWAY).send({message: 'An error has occurred'})
    }
}

const updateStudentId = async (req, res) => {
    const {id} = req.user
    const student = await userModel.findOne({id: id});
    if(!student.studentId){
        await student.updateOne({id: id}, {studentId: req.body.studentId})
    }
}

/**
 * user change password
 */
const changePassword = async (req, res) => {
    let user = new User(req.user);
    let update = req.body
    console.log(update);
    let userQuery = await userModel.findOne({id: user.id})
    if(update.changePassword != update.confirmPassword){
        return res.status(BAD_REQUEST).send({ message: "Confirm password does not match", errors: "Not match" });
    }
    if(userQuery.password != CryptoJS.MD5(update.currentPassword).toString()){
        return res.status(BAD_REQUEST).send({ message: "Current password does not match", errors: "Not match" });
    }

    try{
        update.changePassword = CryptoJS.MD5(update.changePassword).toString()
        await userModel.updateOne({id: user.id}, {password: update.changePassword})
        return res.status(OK).send({message: 'Change profile successfully'})
        
    }
    catch(err){
        return res.status(BAD_GATEWAY).send({message: 'change password unsuccessed'})
    }
}

/**
 * user change profile
 */
const changeProfile = async (req, res) => {
    let user = new User(req.user)
    let update = new User(req.body);

    let validate = new ValidateService(update);
    validate.validateEmail();
    if (validate.hasError())
        return res.status(BAD_REQUEST).send({ message: "Change profile failed", errors: validate.errors })

    try{
        await userModel.updateOne({id: user.id}, {fullname: update.fullname, email: update.email})
        return res.status(OK).send({message: 'Change data successfully'})
    }
    catch(err){
        return res.status(BAD_GATEWAY).send({message: 'change password unsuccessed'})
    }
}

/**
 * user login by google
 */

const googleLogin = async (req, res) => {
    console.log('header', req.headers);
    const userLogin = req.body;
    const userQuery = await userModel.findOne({username: userLogin.email});
    if(!userQuery){
        const user = new User({username: userLogin.email, email: userLogin.email, fullname: userLogin.fullname, access_token: userLogin.access_token})
        user.id = uuidv1();

        // console.log(user)
        try {
            user.access_token = jwtService.generateJwt(user)
            await userModel.create(user)
            return res.status(OK).send({ message: 'Login successfully', data: userLogin })
        }
        catch (err) {
            console.log(err)
            return res.status(BAD_GATEWAY).send({ message: "OOps" })
        }
    
    }

    try {
        userQuery.access_token = jwtService.generateJwt(userQuery)
        await userModel.updateOne({ id: userQuery.id }, {access_token: userQuery.access_token})
        return res.status(OK).send({ message: 'Login successfully', data: userQuery })
    }
    catch (err) {
        console.log(err);
        return res.status(BAD_GATEWAY).send({ message: "OOps" })
    }

}

module.exports = {
    userList,
    userRegister,
    userLogin,
    authenticate,
    userInfo,
    userLogout,
    changePassword,
    changeProfile,
    googleLogin, 
    updateStudentId,
}