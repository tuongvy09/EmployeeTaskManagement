const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const { doc, getDoc } = require("firebase/firestore");
require('dotenv').config();

const authMiddleware = {
    verifyToken: async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json("You're not authenticated");
        }

        const accessToken = authHeader.split(' ')[1];

        jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, async (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json('Token has expired');
                } else if (err.name === 'JsonWebTokenError') {
                    return res.status(403).json('Token is not valid');
                } else {
                    return res.status(403).json('Token verification failed');
                }
            }

            try {
                const userRef = doc(db, 'employees', decoded.id);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    return res.status(401).json({
                        success: false,
                        message: 'User không tồn tại',
                    });
                }

                const user = userSnap.data();

                req.user = {
                    id: userSnap.id,
                    name: user.name || '',
                    email: user.email || '',
                    role: user.role || '',
                    phoneNumber: user.phoneNumber || '',
                };

                next();
            } catch (error) {
                console.error('Lỗi khi lấy user từ Firestore:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server khi lấy thông tin user',
                });
            }
        });
    },

    verifyTokenAndOwner: (req, res, next) => {
        authMiddleware.verifyToken(req, res, () => {
            if (req.user.role === 'owner') {
                next();
            } else {
                return res.status(403).json("Bạn không có quyền truy cập (cần vai trò owner)");
            }
        });
    },

    verifyTokenAndEmployee: (req, res, next) => {
        authMiddleware.verifyToken(req, res, () => {
            if (req.user.role === 'employee') {
                next();
            } else {
                return res.status(403).json("Bạn không có quyền truy cập (cần vai trò employee)");
            }
        });
    },
};

module.exports = authMiddleware;
