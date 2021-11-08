const { StatusCodes } = require('http-status-codes');
const { userModel, User } = require('../models/user.model');
const { UNAUTHORIZED, FORBIDDEN, BAD_REQUEST, BAD_GATEWAY } = StatusCodes
const JwtService = require('../services/jwt.service')
const jwtService = new JwtService()


class Middleware {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
        this.error = null
        this.user = new User({})


    }

    async permission(role) {
        await this.getInfo()

        if (!!this.error) return this.res.status(UNAUTHORIZED).send(this.error)
        if (this.user.role != role) return this.res.status(UNAUTHORIZED).send({ message: 'You not permission', errorCode: 4 })

        this.req.user = this.user;
        this.next();
    }

    async getInfo() {
        try {
            let authorization = this.req.headers.authorization;
            let accessToken = authorization.split(" ")[1].trim();
            let data = jwtService.verifyJwt(accessToken);
            if (!data)
                return this.error = { message: 'Access token invalid', errorCode: 1 }

            let user = await userModel.findOne({ id: data.id });
            if (!user)
                return this.error = { message: 'Access token do not match', errorCode: 2 }

            if (user.access_token != accessToken)
                return this.error = { message: 'Access token does not match', errorCode: 3 }

            this.user = new User(user._doc);
        }
        catch (err) {
            return this.error = { message: 'Access token invalid', errorCode: 1 }
        }
        
    }
}

module.exports = {
    Middleware
}