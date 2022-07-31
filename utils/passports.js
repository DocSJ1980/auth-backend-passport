const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User.js')

module.exports = function (passport) {
    // console.log("Passport function called");
    passport.use(
        new JwtStrategy({
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        },
            function (jwt_payload, done) {
                // console.log(jwt_payload);
                User.findOne({ _id: jwt_payload.id }, function (err, user) {
                    if (err) {
                        return done(err, false)
                    }

                    if (user) {
                        return done(null, user)
                    }
                    else {
                        return done(null, false)
                    }
                })
            }
        )
    )
}