// controllers/authController.js
const { Op } = require('sequelize');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d'
    });
};

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const user = await User.create({ username, email, password });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Registration failed',
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
                email: user.email
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

module.exports = { register, login };