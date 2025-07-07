// clearMessages.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

async function clearData() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Conectat la MongoDB');

        const deletedConversations = await Conversation.deleteMany({});
        console.log(`🧹 Șterse ${deletedConversations.deletedCount} conversații`);

        const deletedMessages = await Message.deleteMany({});
        console.log(`🧹 Șterse ${deletedMessages.deletedCount} mesaje`);

        await mongoose.disconnect();
        console.log('🔌 Deconectat de la MongoDB');
    } catch (err) {
        console.error('❌ Eroare:', err);
    }
}

clearData();
