const mongoose = require("mongoose");
// import jwt from "jsonwebtoken";
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"]
    },

    email: {
        type: String,
        required: [true, "Please provide a valid email"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
    },

    password: {
        type: String,
        required: [true, "Please fill the password"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false,
    },

    // avatar: {
    //     public_id: String,
    //     url: String,
    // },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    // tasks: [
    //     {
    //         title: "String",
    //         description: "String",
    //         completed: Boolean,
    //         createdAt: Date,
    //     },
    // ],

    // verified: {
    //     type: Boolean,
    //     default: false,
    // },

    // otp: Number,
    // otp_expiry: Date,
    resetPasswordOtp: Number,
    resetPasswordOtpExpiry: Date,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// userSchema.methods.getJWTToken = function () {
//     return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
//     });
// };

// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };

// userSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("User", userSchema);
module.exports = User;
