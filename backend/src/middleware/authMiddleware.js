const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided, authorization denied.' });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is not valid, authorization denied.' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = {
    isAuthenticated,
};