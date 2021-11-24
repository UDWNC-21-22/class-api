const { StatusCodes } = require('http-status-codes');
const { userModel, User } = require('../models/user.model');
const { UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY } = StatusCodes
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()


const middleware = async (req, res, next)=>{
    try {
        let authorization = req.headers.authorization;
        let accessToken = authorization.split(" ")[1].trim();
        let data = jwtService.verifyJwt(accessToken);
    
        if (!data)
            return res.status(UNAUTHORIZED).send({ message: 'Access token invalid', errorCode: 1 })

        let user = await userModel.findOne({ id: data.id });
     
        if (!user)
            return res.status(UNKNOWN_USER).send({ message: 'Access token do not match', errorCode: 2 })

        if (user.access_token != accessToken)
            return res.status(UNAUTHORIZED).send({ message: 'Access token does not match', errorCode: 3 })

        req.user = new User(user._doc);
        next()
    }
    catch (err) {
        return res.status(UNAUTHORIZED).send({ message: 'Access token invalid', errorCode: 1 })
    }
}


module.exports = {
    middleware
}