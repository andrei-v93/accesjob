require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Autentificare necesară' });
    }

    const token = authHeader.split(' ')[1]; // extrage token-ul

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            userType: decoded.userType,
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid sau expirat' });
    }
};

module.exports = authMiddleware;
