const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Creare conversație (doar recrutorul poate iniția)
router.post('/start', async (req, res) => {
    try {
        const { recruiterId, employeeId } = req.body;

        const recruiter = await User.findById(recruiterId);
        const employee = await User.findById(employeeId);

        if (!recruiter || !employee || recruiter.userType !== 'recruiter' || employee.userType !== 'angajat') {
            return res.status(400).json({ message: 'Utilizatori invalizi' });
        }

        // Caută conversația existentă în funcție de recruiterId și employeeId
        let conversation = await Conversation.findOne({ recruiterId, employeeId });

        if (!conversation) {
            conversation = new Conversation({
                recruiterId,
                employeeId,
                participants: [recruiterId, employeeId]
            });
            await conversation.save();
        }

        res.status(200).json(conversation);
    } catch (err) {
        console.error('Eroare la inițializarea conversației:', err);
        res.status(500).json({ message: 'Eroare server la inițiere conversație' });
    }
});

// Obține toate conversațiile utilizatorului
router.get('/conversations/:userId', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const conversations = await Conversation.find({
            $or: [
                { recruiterId: userId },
                { employeeId: userId }
            ]
        })
            .populate('recruiterId', 'name userType pozaUrl')
            .populate('employeeId', 'name userType pozaUrl')
            .sort({ lastUpdated: -1 });

        res.status(200).json(conversations);
    } catch (err) {
        console.error('Eroare la încărcarea conversațiilor:', err);
        res.status(500).json({ message: 'Eroare la obținerea conversațiilor' });
    }
});


// Obține toate mesajele dintr-o conversație
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

// Trimite un mesaj nou
router.post('/message', async (req, res) => {
    try {
        console.log('🔧 Mesaj primit:', req.body); // ← adaugă asta
        const { conversationId, senderId, text } = req.body;

        if (!conversationId || !senderId || !text) {
            console.log('❌ Câmpuri lipsă:', { conversationId, senderId, text });
            return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
        }

        const message = new Message({ conversationId, senderId, text });
        await message.save();

        res.status(201).json(message);
    } catch (err) {
        console.error('❌ Eroare la trimiterea mesajului:', err);
        res.status(500).json({ message: 'Eroare la trimiterea mesajului' });
    }
});

module.exports = router;
