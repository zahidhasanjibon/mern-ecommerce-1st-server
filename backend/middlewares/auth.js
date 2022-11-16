/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');

const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/userModel');

exports.isAuthenticatedUser = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler('please Login to access this resources', 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedData) {
        return next(new ErrorHandler('token not authorized', 401));
    }
    req.user = await User.findById(decodedData.id);
    next();
};
exports.authorizedRoles =
    (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(
                new ErrorHandler(
                    `Role ${req.user.role} is not allowed to access this resources`,
                    403
                )
            );
        }
        next();
    };
