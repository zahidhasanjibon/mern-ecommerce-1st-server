// const ErrorHandler = require('../utils/errorHandler');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 5000;
    err.message = err.message || 'Internal Server Error';

    res.status(err.statusCode).json({
        success: false,
        error: err.message,
    });
};
