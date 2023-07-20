const jwt = require('jsonwebtoken');

class AuthJwt {
    async authJwt(req, res, next) {
        try {
            if(req.cookies && req.cookies.user_token) {
                jwt.verify(req.cookies.user_token, 'MYS3CR3TK3Y', (err, data) => {
                    if(!err) {
                        req.user = data;
                        
                        next();
                    }else {
                        console.log(err);
                        next();
                    }
                })
            }else {
                next();
            }
        }catch(err) {
            throw err;
        }
    }
}
 module.exports = new AuthJwt()