const {StatusCodes} = require('http-status-codes');
const { userModel } = require('../models/user.model');
const {UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY} = StatusCodes
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()

  
async function teacherMiddleware(req, res, next) {
    let authorization  = req.headers.authorization;
    let accessToken = authorization.split(" ")[1].trim();
    // console.log("access_token: ", accessToken)
    let data = jwtService.verifyJwt(accessToken);
    if (!data)
        return res.status(UNAUTHORIZED).send({message: 'Access token invalid'})

    let user = await userModel.findOne({id: data.id, role: 'teacher'});
    if (!user)
        return res.status(UNAUTHORIZED).send({message: 'Access token do not match'})

    if (user.access_token != accessToken)
        return res.status(UNAUTHORIZED).send({message: 'Access token does not match'})

    req.user = user;
    next()
}


module.exports = {
    teacherMiddleware
}