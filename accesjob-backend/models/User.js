const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userType: { type: String, enum: ['recruiter', 'angajat'], required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    company: String,
    disability: String,
    skills: [String],
    phone: String,
    tara: String,
    judet: String,
    localitate: String,
    domeniu: String,
    pozitie: String,
    disponibilitate: String,
    pozaUrl: String,
    cvUrl: String,
    descriere: String,           // 🔥 nou
    experienta: String,          // 🔥 nou
    resetToken: String,
    resetTokenExpiry: Date,
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', userSchema);
