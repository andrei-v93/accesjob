require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Conectat la MongoDB');
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Serverul rulează pe http://localhost:${process.env.PORT}`);
        });
    })
    .catch(err => console.error('❌ Eroare la conectarea MongoDB:', err));
