const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'please Enter your Name'],
            maxlength: [30, "name can't excedde 30 characters"],
            minlength: [4, 'name should be at least 5 character'],
        },
        email: {
            type: String,
            required: [true, 'enter your email'],
            unique: true,
            validate: [validator.isEmail, 'please enter a valid email'],
        },
        password: {
            type: String,
            required: [true, 'enter your password'],
            minlength: [8, 'password should be greater than 8 characters'],
            select: false,
        },
        avatar: {
            public_id: {
                type: String,
                required: true,
            },
            url: { type: String, required: true },
        },
        role: {
            type: String,
            default: 'user',
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);
// hashed password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});
// JWT Token generator
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
// Compare password
userSchema.methods.comparePassword = async function (EnterdPassword) {
    return await bcrypt.compare(EnterdPassword, this.password);
};
// generating password reset token
userSchema.methods.getResetPasswordToken = function () {
    // generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
