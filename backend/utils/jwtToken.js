const sendToken = async (user, statusCode, res) => {
    // option for cookie
    const object = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    const token = user.getJWTToken();
    return res.status(statusCode).cookie('token', token, object).json({
        success: true,
        user,
        token,
    });
};
module.exports = sendToken;
