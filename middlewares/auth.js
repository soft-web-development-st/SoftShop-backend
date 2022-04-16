// check if user is authenticated or not
const jwt = require('jsonwebtoken');
const User = require('../models/user');
exports.isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
   
    if (!token) {
        return next('Login first to access this resource', 401)
        
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    next();
}

// handling users roles

exports.authorizedRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(`Role ${req.user.role} is not allow to access this resource`,403);
        }
        next()
    }
}