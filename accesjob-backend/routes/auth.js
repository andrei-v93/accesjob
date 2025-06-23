
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendResetEmail = require('../utils/sendResetEmail');

// Multer configurare upload (poza, cv)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// ROUTE: GET profil (date user)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User nu a fost găsit' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Eroare la încărcarea profilului' });
    }
});

// ROUTE: PUT update profil
router.put(
    '/profile',
    authMiddleware,
    upload.fields([{ name: 'poza' }, { name: 'cv' }]),
    async (req, res) => {
        try {
            const {
                name,
                email,
                phone,
                company,
                disability,
                skills,
                tara,
                judet,
                localitate,
                domeniu,
                pozitie,
                disponibilitate,
                descriere,            // nou
                experienta
            } = req.body;

            let parsedSkills;

            if (skills) {
                if (typeof skills === 'string') {
                    try {
                        parsedSkills = JSON.parse(skills); // încearcă să parsezi dacă e JSON string
                    } catch {
                        parsedSkills = skills.split(',').map(s => s.trim());
                    }
                } else if (Array.isArray(skills)) {
                    parsedSkills = skills;
                }
            } else {
                parsedSkills = undefined;
            }

            const updateData = {
                name,
                email,
                phone,
                company,
                disability,
                skills: parsedSkills,
                tara,
                judet,
                localitate,
                domeniu,
                pozitie,
                disponibilitate,
                descriere,            // nou
                experienta
            };

            // elimină câmpurile undefined (pentru a nu suprascrie cu undefined)
            Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

            // Fișiere
            if (req.files) {
                if (req.files['poza']) {
                    updateData.pozaUrl = `http://localhost:5000/uploads/${req.files['poza'][0].filename}`;
                }
                if (req.files['cv']) {
                    updateData.cvUrl = `http://localhost:5000/uploads/${req.files['cv'][0].filename}`;
                }
            }

            const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');

            if (!updatedUser) return res.status(404).json({ message: 'User nu a fost găsit' });

            res.json(updatedUser);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Eroare la actualizarea profilului' });
        }
    }
);

// ROUTE: POST login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email incorect' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Parolă incorectă' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            token,
            user: {
                id: user._id,
                userType: user.userType,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                pozaUrl: user.pozaUrl,
                cvUrl: user.cvUrl,
                tara: user.tara,
                judet: user.judet,
                localitate: user.localitate,
                disability: user.disability,
                skills: user.skills,
                domeniu: user.domeniu,
                pozitie: user.pozitie,
                disponibilitate: user.disponibilitate,
                descriere: user.descriere,         // 🔥 nou
                experienta: user.experienta        // 🔥 nou
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la autentificare' });
    }
});

// Configurare nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ROUTE: POST /forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Nu există cont cu acest email' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 oră

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            to: user.email,
            subject: 'Resetare parolă AccesJob',
            html: `
                <p>Ai cerut resetarea parolei.</p>
                <p>Dă click pe linkul de mai jos pentru a seta o parolă nouă:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Dacă nu ai cerut acest email, poți să-l ignori.</p>
            `,
        });

        res.json({ message: 'Emailul a fost trimis. Verifică inbox-ul.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Eroare la trimiterea emailului' });
    }
});


// ROUTE: POST reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Caută user după token și expirare valabilă
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Token invalid sau expirat' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Parola a fost resetată cu succes' });
    } catch (err) {
        console.error('Eroare la resetarea parolei:', err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

// ROUTE: POST /register - creare cont nou
router.post('/register', async (req, res) => {
    const { userType, name, email, password, company, disability, skills } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Emailul este deja folosit' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            userType,
            name,
            email,
            password: hashedPassword,
            company: userType === 'recruiter' ? company : undefined,
            disability: userType === 'angajat' ? disability : undefined,
            skills: userType === 'angajat' && skills ? skills.split(',').map(s => s.trim()) : [],
        });

        await newUser.save();

        res.status(201).json({ message: 'Cont creat cu succes' });
    } catch (err) {
        console.error('Eroare la înregistrare:', err);
        res.status(500).json({ message: 'Eroare server la înregistrare' });
    }
});

// ROUTE: GET /angajati/:id - Detalii despre un angajat
router.get('/angajati/:id', async (req, res) => {
    try {
        const angajat = await User.findOne({
            _id: req.params.id,
            userType: 'angajat'
        }).select('-password');

        if (!angajat) {
            return res.status(404).json({ message: 'Angajatul nu a fost găsit' });
        }

        res.json(angajat);
    } catch (err) {
        console.error('Eroare la obținerea angajatului:', err);
        res.status(500).json({ message: 'Eroare server' });
    }
});

// ROUTE: GET /api/auth/me - Fetch date profilul utilizatorului curent
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Eroare server' });
    }
});

// Obține lista tuturor utilizatorilor de tip "angajat" cu filtrare
router.get('/angajati', async (req, res) => {
    try {
        const filter = { userType: 'angajat' };
        const createRegex = val => new RegExp(`^${val.trim()}$`, 'i');

        if (req.query.localitate) filter.localitate = { $regex: createRegex(req.query.localitate) };
        if (req.query.domeniu) filter.domeniu = { $regex: createRegex(req.query.domeniu) };
        if (req.query.disponibilitate) filter.disponibilitate = { $regex: createRegex(req.query.disponibilitate) };
        if (req.query.disability) filter.disability = { $regex: createRegex(req.query.disability) };

        const angajati = await User.find(filter).select('-password');
        res.json(angajati);
    } catch (err) {
        console.error('Eroare la încărcarea angajaților:', err);
        res.status(500).json({ message: 'Eroare server' });
    }
});


module.exports = router;
