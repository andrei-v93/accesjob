require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servește fișierele din uploads/messages
app.use('/uploads/messages', express.static(path.join(__dirname, 'uploads/messages')));

app.use('/api/auth', authRoutes);

// Pasăm `io` către messages
app.use('/api/messages', (req, res, next) => {
    req.io = io;
    next();
}, messageRoutes);

io.on('connection', (socket) => {
    console.log(`🟢 Socket conectat: ${socket.id}`);

    socket.on('joinRoom', ({ conversationId }) => {
        socket.join(conversationId);
        console.log(`👥 Socket ${socket.id} a intrat în camera: ${conversationId}`);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Socket deconectat: ${socket.id}`);
    });

    socket.on('typing', ({ conversationId, senderId, senderName }) => {
        socket.to(conversationId).emit('typing', {
            conversationId,
            senderId,
            senderName,
        });
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Conectat la MongoDB');
        server.listen(process.env.PORT, () => {
            console.log(`🚀 Serverul rulează pe http://localhost:${process.env.PORT}`);
        });
    })
    .catch(err => console.error('❌ Eroare la conectarea MongoDB:', err));
