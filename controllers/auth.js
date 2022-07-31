const User = require("../models/User.js");
const ErrorResponse = require("../utils/errorResponse.js")
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.create({
            username, email, password
        });
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
    };

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorResponse("Invalid credentials", 401));
        };

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 404));
        };

        const payload = {
            username: user.username,
            id: user._id,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.status(201).json({
            success: true,
            message: "Logged in successfully",
            token: "Bearer " + token,
        });

    } catch (error) {
        next(error);
    }
};

exports.protected = (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Token Verified Successfully",
        user: {
            id: req.user._id,
            username: req.user.username
        }
    });
}

exports.forgotPassword = (req, res, next) => {
    res.send('Forgot Password Route');
}

exports.resetPassword = (req, res, next) => {
    res.send('Reset Password Route');
};