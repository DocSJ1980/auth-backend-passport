const User = require("../models/User.js");
const ErrorResponse = require("../utils/errorResponse.js")
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require("../utils/sendEmail.js");

exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        // const { avatar } = req.files;

        let user = await User.findOne({ email })
        if (user) {
            return next(new ErrorResponse("User already exisits", 400));
        }

        const randomOtp = crypto.randomBytes(20).toString("hex")
        const otp = crypto
            .createHash("sha256")
            .update(randomOtp)
            .digest("hex")
        console.log(otp)

        user = await User.create({
            username,
            email,
            password,
            avatar: {
                public_id: "",
                url: ""
            },
            otp,
            otp_expiry: Date.now() + process.env.OTP_EXPIRE * 60 * 1000
        });

        const resetToken = user.otp

        const resetUrl = `http://auth.sjnotes.tk:3000/verify/?e=${email}&rt=${resetToken}`
        const message = `<h1>Email Verification</h1>
        <p>Please go to this link to Verify your email</p>
        <a href=${resetUrl}>Verify Email</a>`

        await sendEmail(
            email, "Verify Your Accout", message
        )

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                message: "Please verify your email to continue."
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.verify = async (req, res, next) => {
    try {
        const email = req.params.e;
        const otp = req.params.rt;
        let user = await User.findOne({ email })
        if (user.otp !== otp || user.otp_expiry < Date.now()) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid OTP or has been Expired" });
        }
        user.verified = true;
        user.otp = null;
        user.otp_expiry = null;

        await user.save();

        const payload = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.status(201).json({
            success: true,
            message: "Email Verified successfully",
            token: "Bearer " + token,
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
    try {
        res.status(200).json({
            success: true,
            message: "Token Verified Successfully",
            user: {
                id: req.user._id,
                username: req.user.username
            }
        });
    } catch (error) {
        next(error);
    }
}

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return next(new ErrorResponse("Email could not be found", 404))
        }

        await user.getResetPasswordToken()
        await user.save()
        const resetToken = user.resetPasswordOtp

        const resetUrl = `http://auth.sjnotes.tk:3000/passwordreset/${resetToken}`
        const message = `<h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl}>Reset Password</a>`
        try {
            await sendEmail(
                user.email,
                "Password Reset Requeest",
                message
            )
            res.status(200).json({
                success: true,
                data: "Email sent"
            })
        } catch (error) {
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpiry = undefined;
            await user.save();
            return next(new ErrorResponse("Email Could not be sent", 400))
        }
    } catch (error) {
        next(error);
    }
}

exports.resetPassword = async (req, res, next) => {
    const resetPasswordOtpFromEmail = req.params.resetToken
    try {
        const user = await User.findOne({
            resetPasswordOtp: resetPasswordOtpFromEmail,
            resetPasswordOtpExpiry: { $gt: Date.now() }
        })
        if (!user) {
            return next(new ErrorResponse("Invalid Reset Token", 400))
        }

        user.password = req.body.password
        user.resetPasswordOtp = undefined
        user.resetPasswordOtpExpiry = undefined

        await user.save()

        res.status(201).json({
            success: true,
            data: "Password Reset Success"
        })

    } catch (error) {
        next(error);
    }
};