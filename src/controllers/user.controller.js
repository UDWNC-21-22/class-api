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
    // console.log(user)
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
 * Get info teacher
 * @param id string
 */
const userInfo = async (req, res) => {
    let userQuery = await userModel.findOne({ id: req.params.id })
    if (!userQuery)
        return res.status(BAD_REQUEST).send({ message: 'User not found' })
    return res.status(OK).send({ data: new User(userQuery) })
}




module.exports = {
    userList,
    userRegister,
    userLogin,
    authenticate
}