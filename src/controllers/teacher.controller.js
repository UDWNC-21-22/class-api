const {StatusCodes} = require('http-status-codes')
const {OK, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY} = StatusCodes
const {validateEmail} = require('../helpers/form.helper')
const { User, userModel } = require('../models/user.model')
const { v1: uuidv1 } = require('uuid');
const CryptoJS = require("crypto-js");
const ValidateService = require('../services/validate.service')
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()


const teacherInfo = (req, res) => {
    let user = new User(req.user)
    return res.status(OK).send({data: user})
}

module.exports = {
    teacherInfo
}