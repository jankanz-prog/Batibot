// controllers/authController.js - Updated with admin functionality
const { Op } = require('sequelize');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Profile = require('../models/profileModel');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.create({ username, email, password });
        await Profile.create({ user_id: user.id });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

const createAdmin = async (req, res) => {
    try {
        const { username, email, password, adminKey } = req.body;

        // Check admin creation key (you should set this in your environment)
        const requiredAdminKey = process.env.ADMIN_CREATION_KEY || 'super-secret-admin-key';

        if (adminKey !== requiredAdminKey) {
            return res.status(403).json({
                success: false,
                message: 'Invalid admin creation key'
            });
        }

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: 'admin'
        });

        await Profile.create({ user_id: user.id });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Admin creation failed',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const loginField = email || username;

        if (!loginField || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username/email and password are required'
            });
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: loginField },
                    { username: loginField }
                ]
            }
        });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findByPk(userId);

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        await user.update({ password: newPassword });

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const verifyToken = async (req, res) => {
    try {
        // The authenticateToken middleware already validates the token
        // and sets req.user, so we just need to return the user data
        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    register,
    createAdmin,
    login,
    changePassword,
    authenticateToken,
    requireAdmin,
    verifyToken
};
