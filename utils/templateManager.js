const { readJSON, writeJSON, PREMIUM_FILE } = require('./database');
const path = require('path');

const TEMPLATES_FILE = './database/templates.json';

class TemplateManager {
    // Şablonları yükle
    static getTemplates(guildId) {
        const data = readJSON(TEMPLATES_FILE, { templates: {} });
        return data.templates[guildId] || [];
    }

    // Şablon oluştur
    static createTemplate(guildId, name, templateData) {
        const data = readJSON(TEMPLATES_FILE, { templates: {} });
        if (!data.templates[guildId]) {
            data.templates[guildId] = [];
        }

        // Aynı isimde şablon var mı kontrol et
        if (data.templates[guildId].some(t => t.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, reason: 'Bu isimde bir şablon zaten var.' };
        }

        // Max şablon limiti (Premium kontrolü burada yapılabilir)
        if (data.templates[guildId].length >= 10) {
            return { success: false, reason: 'Maksimum şablon limitine ulaştınız (10).' };
        }

        data.templates[guildId].push({
            name,
            createdAt: Date.now(),
            ...templateData
        });

        writeJSON(TEMPLATES_FILE, data);
        return { success: true };
    }

    // Şablon sil
    static deleteTemplate(guildId, name) {
        const data = readJSON(TEMPLATES_FILE, { templates: {} });
        if (!data.templates[guildId]) return { success: false, reason: 'Şablon bulunamadı.' };

        const initialLength = data.templates[guildId].length;
        data.templates[guildId] = data.templates[guildId].filter(t => t.name.toLowerCase() !== name.toLowerCase());

        if (data.templates[guildId].length === initialLength) {
            return { success: false, reason: 'Şablon bulunamadı.' };
        }

        writeJSON(TEMPLATES_FILE, data);
        return { success: true };
    }

    // Şablon getir
    static getTemplate(guildId, name) {
        const templates = this.getTemplates(guildId);
        return templates.find(t => t.name.toLowerCase() === name.toLowerCase());
    }
}

module.exports = { TemplateManager };
