const jwt  = require('jsonwebtoken');


module.exports = class JwtService {

    static STATUS_VALID = 0;
    static STATUS_INVALID = 1;
    static STATUS_EXPIRED = 2;

    constructor(obj){
        this.obj = obj;
    }

    async generateJwt(){
        const payload = JSON.stringify({
            id: this.obj.id,
            username: this.obj.username,
            email: this.obj.email
        });

        return jwt.sign({
            data: payload
          }, process.env.JWT_SIGNING_KEY, { expiresIn: '7d' });
    }

    verifyJwt(token){
        let result;

        try {
            result = jwt.verify(token, process.env.JWT_SIGNING_KEY);
            return JSON.parse(result.data)

        } catch (err) {
            return null
        }

    }
}