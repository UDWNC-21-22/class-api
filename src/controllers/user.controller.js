const {StatusCodes} = require('http-status-codes')
const {OK, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY} = StatusCodes
const {validateEmail} = require('../helpers/form.helper')
const { User, userModel } = require('../models/user.model')
const { v1: uuidv1 } = require('uuid');
const CryptoJS = require("crypto-js");
const ValidateService = require('../services/validate.service')


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
    
    return res.status(200).send({data})
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
        return res.status(BAD_REQUEST).send({message: "Regsiter failed", errors: validate.errors})

    // check username exists
    const userQuery = await userModel.findOne({username: user.username})
    if (!!userQuery) {
        return res.status(BAD_REQUEST).send({message: 'Register failed', errors: {username: 'Username already registered'}})
    }


    user.id = uuidv1();
    user.password = CryptoJS.MD5(user.password).toString()

    // console.log(user)
    try{
        await userModel.create(user)
        return res.status(OK).send({message: "Register successfully"})
    }
    catch(err){
        console.log(err)
        return res.status(BAD_GATEWAY).send({message: "OOps"})
    }

}




module.exports = {
    userList,
    userRegister
}