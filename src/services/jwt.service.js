const jwt  = require('jsonwebtoken');


module.exports = class JwtService {

    static STATUS_VALID = 0;
    static STATUS_INVALID = 1;
    static STATUS_EXPIRED = 2;

    generateJwt(obj){
        const payload = JSON.stringify({
            id: obj.id,
            username: obj.username,
            email: obj.email
        });

        return jwt.sign({
            data: payload
          }, process.env.JWT_SIGNING_KEY, { expiresIn: '7d' });
    }

    generateInviteToken(obj){
        const payload = JSON.stringify({
            userId: obj.userId,
            classId: obj.classId,
            role: obj.role,
            email: obj.email
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