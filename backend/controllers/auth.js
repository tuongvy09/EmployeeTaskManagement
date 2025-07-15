const jwt = require('jsonwebtoken');
const { generateAccessToken } = require('../Utils/TokenService.js');
const db = require('../config/firebase');

const refreshToken = async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        try {
            const userDoc = await db.collection('employees').doc(decoded.id).get();
            if (!userDoc.exists) {
                return res.status(404).json({ message: 'User not found' });
            }
            const newAccessToken = generateAccessToken(decoded.id);
            return res.json({ accessToken: newAccessToken });
        } catch (error) {
            console.error('Refresh token error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
};

module.exports = {
    refreshToken,
};
