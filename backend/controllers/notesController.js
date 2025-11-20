// controllers/notesController.js
const Note = require('../models/noteModel');

const createNote = async (req, res) => {
    try {
        const { 
            title, 
            content, 
            color, 
            priority, 
            pinned, 
            archived, 
            tags, 
            attachments, 
            drawings, 
            reminder 
        } = req.body;
        const userId = req.user.id;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Validate tags max length
        if (tags && Array.isArray(tags) && tags.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 tags allowed per note'
            });
        }

        // Validate priority
        const validPriorities = ['low', 'medium', 'high'];
        const notePriority = priority && validPriorities.includes(priority) ? priority : 'medium';

        const note = await Note.create({
            user_id: userId,
            title,
            content: content || '',
            color: color || null,
            priority: notePriority,
            pinned: pinned || false,
            archived: archived || false,
            tags: tags && tags.length > 0 ? tags : null,
            attachments: attachments && attachments.length > 0 ? attachments : null,
            drawings: drawings || null,
            reminder: reminder || null
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
            order: [
                ['pinned', 'DESC'],
                ['priority', 'DESC'],
                ['updated_at', 'DESC']
            ]
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
        const { 
            title, 
            content, 
            color, 
            priority, 
            pinned, 
            archived, 
            tags, 
            attachments, 
            drawings, 
            reminder 
        } = req.body;
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

        // Validate tags max length
        if (tags !== undefined && Array.isArray(tags) && tags.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 10 tags allowed per note'
            });
        }

        // Validate priority
        const validPriorities = ['low', 'medium', 'high'];
        let updateData = {
            title,
            content: content !== undefined ? content : note.content,
            color: color !== undefined ? color : note.color,
            priority: priority && validPriorities.includes(priority) ? priority : note.priority,
            pinned: pinned !== undefined ? pinned : note.pinned,
            archived: archived !== undefined ? archived : note.archived,
            tags: tags !== undefined ? (tags && tags.length > 0 ? tags : null) : note.tags,
            attachments: attachments !== undefined ? (attachments && attachments.length > 0 ? attachments : null) : note.attachments,
            drawings: drawings !== undefined ? drawings : note.drawings,
            reminder: reminder !== undefined ? reminder : note.reminder
        };

        await note.update(updateData);

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


const togglePin = async (req, res) => {
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

        await note.update({
            pinned: !note.pinned
        });

        res.status(200).json({
            success: true,
            message: 'Note pin status toggled successfully',
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

const toggleArchive = async (req, res) => {
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

        await note.update({
            archived: !note.archived
        });

        res.status(200).json({
            success: true,
            message: 'Note archive status toggled successfully',
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

const updatePriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        const userId = req.user.id;

        const validPriorities = ['low', 'medium', 'high'];
        if (!priority || !validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Priority must be one of: low, medium, high'
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

        await note.update({ priority });

        res.status(200).json({
            success: true,
            message: 'Note priority updated successfully',
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

const updateColor = async (req, res) => {
    try {
        const { id } = req.params;
        const { color } = req.body;
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

        await note.update({ 
            color: color || null 
        });

        res.status(200).json({
            success: true,
            message: 'Note color updated successfully',
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

const updateTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        const userId = req.user.id;

        if (tags !== null && tags !== undefined && (!Array.isArray(tags) || tags.length > 10)) {
            return res.status(400).json({
                success: false,
                message: 'Tags must be an array with maximum 10 items'
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
            tags: tags && tags.length > 0 ? tags : null 
        });

        res.status(200).json({
            success: true,
            message: 'Note tags updated successfully',
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

const setReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reminder } = req.body;
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

        // Validate reminder date (can't be in the past)
        if (reminder) {
            const reminderDate = new Date(reminder);
            const now = new Date();
            if (reminderDate < now) {
                return res.status(400).json({
                    success: false,
                    message: 'Reminder cannot be set in the past'
                });
            }
        }

        await note.update({ 
            reminder: reminder || null 
        });

        res.status(200).json({
            success: true,
            message: 'Note reminder updated successfully',
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

const updateDrawings = async (req, res) => {
    try {
        const { id } = req.params;
        const { drawings } = req.body;
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

        await note.update({ 
            drawings: drawings || null 
        });

        res.status(200).json({
            success: true,
            message: 'Note drawings updated successfully',
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

const uploadAttachments = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
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

        // Create attachment objects
        const newAttachments = req.files.map(file => ({
            name: file.originalname,
            url: `/uploads/notes/${file.filename}`,
            size: file.size,
            type: file.mimetype,
            uploadedAt: new Date().toISOString()
        }));

        // Merge with existing attachments
        const existingAttachments = note.attachments || [];
        const updatedAttachments = [...existingAttachments, ...newAttachments];

        await note.update({ 
            attachments: updatedAttachments 
        });

        res.status(200).json({
            success: true,
            message: 'Attachments uploaded successfully',
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
    toggleFavorite,
    togglePin,
    toggleArchive,
    updatePriority,
    updateColor,
    updateTags,
    setReminder,
    updateDrawings,
    uploadAttachments
};
