const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../utils/passports.js')(passport);

const {
    register,
    verify,
    login,
    protected,
    forgotPassword,
    resetPassword
} = require('../controllers/auth.js');

router.route("/register").post(register);
router.get("/verify/:e/:rt", verify);
router.route("/login").post(login);
router.get("/protected", passport.authenticate('jwt', { session: false }), protected);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").put(resetPassword);

module.exports = router;

