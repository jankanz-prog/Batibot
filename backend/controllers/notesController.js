// controllers/notesController.js
const Note = require('../models/noteModel');

const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const note = await Note.create({
            user_id: userId,
            title,
            content: content || ''
        });

        res.status(201).json({
            success: true,
            message: 'Note created successfully',
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id;

        const notes = await Note.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: 'Notes retrieved successfully',
            data: notes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await Note.findOne({
            where: {
                id: id,
                user_id: userId
            }
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note retrieved successfully',
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const note = await Note.findOne({
            where: {
                id: id,
                user_id: userId
            }
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        await note.update({
            title,
            content: content !== undefined ? content : note.content
        });

        res.status(200).json({
            success: true,
            message: 'Note updated successfully',
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await Note.findOne({
            where: {
                id: id,
                user_id: userId
            }
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        await note.destroy();

        res.status(200).json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await Note.findOne({
            where: {
                id: id,
                user_id: userId
            }
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Toggle the favorited status
        await note.update({
            favorited: !note.favorited
        });

        res.status(200).json({
            success: true,
            message: 'Note favorite status toggled successfully',
            data: note
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
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    toggleFavorite
};
