const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// 🔧 Configurare multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/messages/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// 🔄 Upload fișier
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Niciun fișier trimis' });
    }

    const fileUrl = `${process.env.SERVER_URL}/uploads/messages/${req.file.filename}`;
    res.status(200).json({ url: fileUrl, name: req.file.originalname });
});

// Creare conversație
router.post('/start', async (req, res) => {
    try {
        const { recruiterId, employeeId } = req.body;

        const recruiter = await User.findById(recruiterId);
        const employee = await User.findById(employeeId);

        if (!recruiter || !employee || recruiter.userType !== 'recruiter' || employee.userType !== 'angajat') {
            return res.status(400).json({ message: 'Utilizatori invalizi' });
        }

        let conversation = await Conversation.findOne({ recruiterId, employeeId });

        if (!conversation) {
            conversation = new Conversation({ recruiterId, employeeId });
            await conversation.save();
        }

        res.status(200).json(conversation);
    } catch (err) {
        console.error('Eroare la inițializarea conversației:', err);
        res.status(500).json({ message: 'Eroare server la inițiere conversație' });
    }
});

// Toate conversațiile utilizatorului
router.get('/conversations/:userId', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const conversations = await Conversation.find({
            $or: [{ recruiterId: userId }, { employeeId: userId }]
        })
            .populate('recruiterId', 'name userType pozaUrl')
            .populate('employeeId', 'name userType pozaUrl')
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (err) {
        console.error('Eroare la încărcarea conversațiilor:', err);
        res.status(500).json({ message: 'Eroare la obținerea conversațiilor' });
    }
});

// Toate mesajele dintr-o conversație
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Eroare la obținerea mesajelor' });
    }
});

// Salvare + emitere mesaj nou (text sau fișier)
router.post('/message', async (req, res) => {
    try {
        const { conversationId, senderId, text, fileUrl, fileName } = req.body;

        if (!conversationId || !senderId) {
            return res.status(400).json({ message: 'conversationId și senderId sunt obligatorii.' });
        }

        const messageData = {
            conversationId,
            senderId,
            text: text || '',
            fileUrl,
            fileName
        };

        const message = new Message(messageData);
        await message.save();

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text || 'Fișier trimis',
            lastSenderId: senderId,
            updatedAt: new Date()
        });

        req.io.to(conversationId).emit('receiveMessage', {
            _id: message._id,
            conversationId,
            senderId,
            text: message.text,
            fileUrl: message.fileUrl,
            fileName: message.fileName,
            createdAt: message.createdAt
        });

        res.status(201).json(message);
    } catch (err) {
        console.error('❌ Eroare la trimiterea mesajului:', err);
        res.status(500).json({ message: 'Eroare la trimiterea mesajului' });
    }
});

module.exports = router;
