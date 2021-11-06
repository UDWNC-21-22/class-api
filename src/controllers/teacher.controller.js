const {StatusCodes} = require('http-status-codes')
const {OK, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY} = StatusCodes
const {validateEmail} = require('../helpers/form.helper')
const { User, userModel } = require('../models/user.model')
const { v1: uuidv1 } = require('uuid');
const CryptoJS = require("crypto-js");
const ValidateService = require('../services/validate.service')
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()


const teacherInfo = async (req, res) => {
    let userQuery = await userModel.findOne({id: req.params.id, role: 'teacher'})
    if (!userQuery)
        return res.status(BAD_REQUEST).send({message: 'Teacher not found'})
    return res.status(OK).send({data: new User(userQuery)})
}

module.exports = {
    teacherInfo
}