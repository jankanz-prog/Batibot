// controllers/profileUploadController.js
const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');

const uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get the file path relative to the uploads directory
        const relativePath = `/uploads/profile-pictures/${req.file.filename}`;

        // Find existing profile
        let profile = await Profile.findOne({ where: { user_id: userId } });
        
        if (!profile) {
            // Create profile if it doesn't exist
            profile = await Profile.create({ 
                user_id: userId,
                profile_picture: relativePath
            });
        } else {
            // Delete old profile picture if it exists
            if (profile.profile_picture && profile.profile_picture.startsWith('/uploads/')) {
                const oldFilePath = path.join(__dirname, '..', profile.profile_picture);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            
            // Update profile with new picture path
            await profile.update({ profile_picture: relativePath });
            console.log('Profile updated with new picture path:', relativePath);
        }

        // Get updated user data
        const user = await User.findByPk(userId);

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                wallet_address: user.wallet_address,
                profile_picture: relativePath
            }
        });

    } catch (error) {
        console.error('Profile picture upload error:', error);
        
        // Clean up uploaded file if there was an error
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await Profile.findOne({ where: { user_id: userId } });
        
        if (!profile || !profile.profile_picture) {
            return res.status(404).json({
                success: false,
                message: 'No profile picture found'
            });
        }

        // Delete the file if it exists
        if (profile.profile_picture.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', profile.profile_picture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Update profile to remove picture
        await profile.update({ profile_picture: null });

        // Get updated user data
        const user = await User.findByPk(userId);

        res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                wallet_address: user.wallet_address,
                profile_picture: null
            }
        });

    } catch (error) {
        console.error('Profile picture delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    uploadProfilePicture,
    deleteProfilePicture
};
