require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // frontend vite
        methods: ['GET', 'POST'],
    },
});
const messageRoutes = require('./routes/messages');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/messages', messageRoutes);

// Socket.IO handling
io.on('connection', (socket) => {
    console.log(`🟢 Nou client conectat: ${socket.id}`);

    socket.on('joinRoom', ({ conversationId }) => {
        socket.join(conversationId);
    });

    socket.on('sendMessage', ({ conversationId, message }) => {
        io.to(conversationId).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Client deconectat: ${socket.id}`);
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
