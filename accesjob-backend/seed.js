require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const localitatiByJudet = {
    Prahova: ['Ploiești', 'Câmpina', 'Vălenii de Munte'],
    Alba: ['Alba Iulia', 'Blaj', 'Sebeș'],
    Bucuresti: ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'],
};

const dizabilitatiOptions = ['Vizuală', 'Auditivă', 'Locomotorie', 'Neuro-motorie', 'Altele'];
const disponibilitateOptions = ['Remote', 'On-site', 'Hibrid'];
const tari = ['România'];

const domenii = ['IT', 'Finanțe', 'Marketing', 'Educație', 'Sănătate'];
const pozitii = ['Junior', 'Mid', 'Senior', 'Intern'];
const companies = ['TechCorp', 'EduPlus', 'HealthLife', 'FinanceMax', 'Marketing360'];
const skills = ['Comunicare', 'Responsabilitate', 'Lucru în echipă', 'Adaptabilitate', 'Creativitate'];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateFakeImageUrl(index) {
    return `https://i.pravatar.cc/150?img=${index}`;
}

function generateUsers() {
    const users = [];

    // Generează angajați
    for (let i = 1; i <= 20; i++) {
        const judet = getRandomElement(Object.keys(localitatiByJudet));
        const localitate = getRandomElement(localitatiByJudet[judet]);

        users.push(new User({
            userType: 'angajat',
            name: `Prenume${i} Nume${i}`,
            email: `angajat${i}@example.com`,
            password: bcrypt.hashSync('parola123', 10),
            phone: `07${Math.floor(1000000 + Math.random() * 8999999)}`,
            pozaUrl: generateFakeImageUrl(i),
            cvUrl: `https://example.com/cv/cv${i}.pdf`,
            tara: getRandomElement(tari),
            judet,
            localitate,
            disability: getRandomElement(dizabilitatiOptions),
            skills: skills.sort(() => 0.5 - Math.random()).slice(0, 3),
            domeniu: getRandomElement(domenii),
            pozitie: getRandomElement(pozitii),
            disponibilitate: getRandomElement(disponibilitateOptions),
        }));
    }

    // Generează între 5-10 recruiteri
    const recruiterCount = Math.floor(Math.random() * 6) + 5; // între 5 și 10
    for (let i = 1; i <= recruiterCount; i++) {
        users.push(new User({
            userType: 'recruiter',
            name: `Recruiter${i} Firma${i}`,
            email: `recruiter${i}@example.com`,
            password: bcrypt.hashSync('parola123', 10),
            phone: `07${Math.floor(1000000 + Math.random() * 8999999)}`,
            company: getRandomElement(companies),
            pozaUrl: generateFakeImageUrl(i + 100),
            tara: 'România',
            judet: getRandomElement(Object.keys(localitatiByJudet)),
        }));
    }

    return users;
}

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectat la MongoDB');

        const users = generateUsers();
        await User.insertMany(users);
        console.log(`🎉 Inserat ${users.length} utilizatori (angajați și recruiteri)`);

        process.exit();
    } catch (err) {
        console.error('❌ Eroare la populare:', err);
        process.exit(1);
    }
}

seedDatabase();
