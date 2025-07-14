// ✅ models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastSenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

conversationSchema.index({ recruiterId: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
