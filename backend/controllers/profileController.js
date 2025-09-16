// controllers/profileController.js
const Profile = require('../models/profileModel');

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            avatar_url,
            bio,
            trust_score,
            level,
            reputation_points,
            last_login
        } = req.body;

        const profile = await Profile.findOne({ where: { user_id: userId } });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        await profile.update({
            avatar_url,
            bio,
            trust_score,
            level,
            reputation_points,
            last_login
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { updateProfile };
