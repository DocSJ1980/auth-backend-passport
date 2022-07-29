const User = require("../models/User.js");
exports.register = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.create({
            username, email, password
        });
        res.status(201).json({
            success: true,
            user: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res
            .status(400)
            .json({
                success: "false",
                error: "Please enter email and password"
            })
    };

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            res
                .status(404)
                .json({
                    success: false,
                    error: "Please enter valid credentials"
                })
        };

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            res
                .status(404)
                .json({
                    success: false,
                    error: "Please enter valid credentials PW"
                })
        };

        res.status(201).json({
            success: true,
            token: "h;sjdfa;jdkasdjfak",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.forgotPassword = (req, res, next) => {
    res.send('Forgot Password Route');
}

exports.resetPassword = (req, res, next) => {
    res.send('Reset Password Route');
};