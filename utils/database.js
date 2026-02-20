const fs = require('fs');
const path = require('path');

// Veritabanı dosya yolları
const DB_PATH = './database';
const GIVEAWAYS_FILE = path.join(DB_PATH, 'giveaways.json');
const BLACKLIST_FILE = path.join(DB_PATH, 'blacklist.json');
const HISTORY_FILE = path.join(DB_PATH, 'history.json');
const STATS_FILE = path.join(DB_PATH, 'stats.json');
const PREMIUM_FILE = path.join(DB_PATH, 'premium.json');
const ANTICHEAT_FILE = path.join(DB_PATH, 'anticheat.json');

// Veritabanı klasörü oluştur
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
}

// JSON dosyası okuma fonksiyonu
function readJSON(filePath, defaultValue = {}) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return defaultValue;
    } catch (error) {
        console.error(`[DATABASE] ${filePath} okuma hatası:`, error);
        return defaultValue;
    }
}

// JSON dosyası yazma fonksiyonu
function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`[DATABASE] ${filePath} yazma hatası:`, error);
        return false;
    }
}

// Premium Yönetimi
class PremiumManager {
    static getPremiumData() {
        return readJSON(PREMIUM_FILE, {
            servers: {},
            users: {}
        });
    }

    static savePremiumData(data) {
        return writeJSON(PREMIUM_FILE, data);
    }

    // Sunucu premium kontrolü
    static isServerPremium(guildId) {
        const data = this.getPremiumData();
        const server = data.servers[guildId];
        if (!server) return false;
        if (server.expires === 'lifetime') return true;
        return new Date(server.expires) > new Date();
    }

    // Kullanıcı premium kontrolü  
    static isUserPremium(userId) {
        const data = this.getPremiumData();
        const user = data.users[userId];
        if (!user) return false;
        if (user.expires === 'lifetime') return true;
        return new Date(user.expires) > new Date();
    }

    // Sunucu premium bilgisi
    static getServerPremium(guildId) {
        const data = this.getPremiumData();
        return data.servers[guildId] || null;
    }

    // Kullanıcı premium bilgisi
    static getUserPremium(userId) {
        const data = this.getPremiumData();
        return data.users[userId] || null;
    }

    // Sunucuya premium ekle
    static addServerPremium(guildId, duration, addedBy) {
        const data = this.getPremiumData();

        let expires;
        if (duration === 'lifetime') {
            expires = 'lifetime';
        } else {
            const now = new Date();
            // Eğer mevcut premium varsa ona ekle
            if (data.servers[guildId] && data.servers[guildId].expires !== 'lifetime') {
                const current = new Date(data.servers[guildId].expires);
                if (current > now) {
                    expires = new Date(current.getTime() + duration).toISOString();
                } else {
                    expires = new Date(now.getTime() + duration).toISOString();
                }
            } else {
                expires = new Date(now.getTime() + duration).toISOString();
            }
        }

        data.servers[guildId] = {
            expires,
            addedBy,
            addedAt: new Date().toISOString()
        };

        this.savePremiumData(data);
        return data.servers[guildId];
    }

    // Kullanıcıya premium ekle
    static addUserPremium(userId, duration, addedBy) {
        const data = this.getPremiumData();

        let expires;
        if (duration === 'lifetime') {
            expires = 'lifetime';
        } else {
            const now = new Date();
            if (data.users[userId] && data.users[userId].expires !== 'lifetime') {
                const current = new Date(data.users[userId].expires);
                if (current > now) {
                    expires = new Date(current.getTime() + duration).toISOString();
                } else {
                    expires = new Date(now.getTime() + duration).toISOString();
                }
            } else {
                expires = new Date(now.getTime() + duration).toISOString();
            }
        }

        data.users[userId] = {
            expires,
            addedBy,
            addedAt: new Date().toISOString()
        };

        this.savePremiumData(data);
        return data.users[userId];
    }

    // Sunucu premiumunu kaldır
    static removeServerPremium(guildId) {
        const data = this.getPremiumData();
        if (data.servers[guildId]) {
            delete data.servers[guildId];
            this.savePremiumData(data);
            return true;
        }
        return false;
    }

    // Kullanıcı premiumunu kaldır
    static removeUserPremium(userId) {
        const data = this.getPremiumData();
        if (data.users[userId]) {
            delete data.users[userId];
            this.savePremiumData(data);
            return true;
        }
        return false;
    }

    // Tüm premium sunucuları listele
    static listPremiumServers() {
        const data = this.getPremiumData();
        return Object.entries(data.servers).map(([id, info]) => ({
            id,
            ...info,
            isActive: info.expires === 'lifetime' || new Date(info.expires) > new Date()
        }));
    }

    // Tüm premium kullanıcıları listele
    static listPremiumUsers() {
        const data = this.getPremiumData();
        return Object.entries(data.users).map(([id, info]) => ({
            id,
            ...info,
            isActive: info.expires === 'lifetime' || new Date(info.expires) > new Date()
        }));
    }

    // Premium özellikleri
    static getFeatures(isPremium) {
        if (isPremium) {
            return {
                maxGiveaways: 50,
                maxWinners: 100,
                maxDuration: 30 * 24 * 60 * 60 * 1000, // 30 gün
                customMessages: true,
                scheduledGiveaways: true,
                multipleRequirements: true,
                prioritySupport: true,
                noAds: true,
                customEmojis: true,
                advancedStats: true
            };
        }
        return {
            maxGiveaways: 5,
            maxWinners: 10,
            maxDuration: 7 * 24 * 60 * 60 * 1000, // 7 gün
            customMessages: false,
            scheduledGiveaways: false,
            multipleRequirements: false,
            prioritySupport: false,
            noAds: false,
            customEmojis: false,
            advancedStats: false
        };
    }
}

module.exports = {
    DB_PATH,
    GIVEAWAYS_FILE,
    BLACKLIST_FILE,
    HISTORY_FILE,
    STATS_FILE,
    PREMIUM_FILE,
    ANTICHEAT_FILE,
    readJSON,
    writeJSON,
    PremiumManager
};
