const { readJSON, writeJSON } = require('./database');
const path = require('path');
const fs = require('fs');

const MESSAGES_FILE = path.join(__dirname, '../database/messages.json');

class MessageManager {
    static getMessageCount(guildId, userId) {
        const data = readJSON(MESSAGES_FILE, {});
        if (!data[guildId]) return 0;
        return data[guildId][userId] || 0;
    }

    static addMessage(guildId, userId) {
        const data = readJSON(MESSAGES_FILE, {});
        if (!data[guildId]) data[guildId] = {};
        if (!data[guildId][userId]) data[guildId][userId] = 0;

        data[guildId][userId]++;

        // Optimize: Don't write on every message? For now, write is safe enough for small bots. 
        // For high scale, debounce or cache.
        writeJSON(MESSAGES_FILE, data);
    }
}

module.exports = { MessageManager };
