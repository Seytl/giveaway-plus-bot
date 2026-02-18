const fs = require('fs');
const path = require('path');
const { readJSON, writeJSON } = require('./database');

const LANGUAGE_SETTINGS_FILE = './database/languages.json';
const CUSTOM_LANGUAGES_FILE = './database/custom_languages.json';

// Dil dosyalarını yükle
const languages = {};
const languagesPath = path.join(__dirname, '..', 'languages');

if (fs.existsSync(languagesPath)) {
    const langFiles = fs.readdirSync(languagesPath).filter(file => file.endsWith('.js'));
    for (const file of langFiles) {
        const langCode = file.replace('.js', '');
        languages[langCode] = require(path.join(languagesPath, file));
        console.log(`[DİL] Dil yüklendi: ${languages[langCode].language_name} (${langCode})`);
    }
}

// Varsayılan dil
const DEFAULT_LANGUAGE = 'en';

class LanguageManager {
    // Sunucu dilini al
    static getServerLanguage(guildId) {
        const settings = readJSON(LANGUAGE_SETTINGS_FILE, { servers: {} });
        return settings.servers[guildId] || DEFAULT_LANGUAGE;
    }

    // Sunucu dilini ayarla
    static setServerLanguage(guildId, langCode) {
        if (!languages[langCode]) {
            return false;
        }

        const settings = readJSON(LANGUAGE_SETTINGS_FILE, { servers: {} });
        settings.servers[guildId] = langCode;
        writeJSON(LANGUAGE_SETTINGS_FILE, settings);
        return true;
    }

    // Özel çevirileri al
    static getCustomTranslations(guildId) {
        const custom = readJSON(CUSTOM_LANGUAGES_FILE, { servers: {} });
        return custom.servers[guildId] || {};
    }

    // Özel çeviri ekle/güncelle
    static setCustomTranslation(guildId, key, value) {
        const custom = readJSON(CUSTOM_LANGUAGES_FILE, { servers: {} });
        if (!custom.servers[guildId]) {
            custom.servers[guildId] = {};
        }
        custom.servers[guildId][key] = value;
        writeJSON(CUSTOM_LANGUAGES_FILE, custom);
        return true;
    }

    // Özel çeviriyi sil
    static removeCustomTranslation(guildId, key) {
        const custom = readJSON(CUSTOM_LANGUAGES_FILE, { servers: {} });
        if (custom.servers[guildId] && custom.servers[guildId][key]) {
            delete custom.servers[guildId][key];
            writeJSON(CUSTOM_LANGUAGES_FILE, custom);
            return true;
        }
        return false;
    }

    // Tüm özel çevirileri sıfırla
    static resetCustomTranslations(guildId) {
        const custom = readJSON(CUSTOM_LANGUAGES_FILE, { servers: {} });
        if (custom.servers[guildId]) {
            delete custom.servers[guildId];
            writeJSON(CUSTOM_LANGUAGES_FILE, custom);
            return true;
        }
        return false;
    }

    // Dil çevirisini al (özel çeviriler dahil)
    static get(guildId, key, replacements = {}) {
        const langCode = this.getServerLanguage(guildId);
        const lang = this.getLang(guildId); // Use the robust getLang method
        const customTranslations = this.getCustomTranslations(guildId);

        // Önce özel çevirilere bak, yoksa birleştirilmiş dilden al
        let text = customTranslations[key] || lang[key] || key;

        // Değişken değiştirmeleri
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp(`{${placeholder}}`, 'g'), value);
        }

        return text;
    }

    // Tüm dil dosyasını al (özel çevirilerle birleştirilmiş)
    static getLang(guildId) {
        const langCode = this.getServerLanguage(guildId);
        const defaultLang = languages[DEFAULT_LANGUAGE];
        const selectedLang = languages[langCode] || defaultLang;
        const customTranslations = this.getCustomTranslations(guildId);

        // Merge: Default English -> Selected Language -> Custom Translations
        // This ensures no keys are ever undefined (falling back to English)
        return { ...defaultLang, ...selectedLang, ...customTranslations };
    }

    // Mevcut dilleri listele
    static getAvailableLanguages() {
        return Object.entries(languages).map(([code, lang]) => ({
            code,
            name: lang.language_name,
            nativeName: lang.language_name
        }));
    }

    // Dil var mı kontrol
    static isValidLanguage(langCode) {
        return !!languages[langCode];
    }

    // Varsayılan dili al
    static getDefaultLanguage() {
        return DEFAULT_LANGUAGE;
    }

    // Düzenlenebilir anahtarları al
    static getEditableKeys() {
        return [
            // Çekiliş başlıkları
            { key: 'giveaway_started', category: 'titles', description: 'Çekiliş başladı başlığı' },
            { key: 'giveaway_ended', category: 'titles', description: 'Çekiliş bitti başlığı' },
            { key: 'congratulations', category: 'titles', description: 'Tebrikler mesajı' },

            // Çekiliş bilgileri
            { key: 'prize', category: 'info', description: 'Ödül etiketi' },
            { key: 'sponsor', category: 'info', description: 'Sponsor etiketi' },
            { key: 'winner_count', category: 'info', description: 'Kazanan sayısı etiketi' },
            { key: 'participants', category: 'info', description: 'Katılımcı etiketi' },
            { key: 'ends_at', category: 'info', description: 'Bitiş zamanı etiketi' },
            { key: 'winners', category: 'info', description: 'Kazananlar etiketi' },

            // Butonlar
            { key: 'join_button', category: 'buttons', description: 'Katıl butonu' },
            { key: 'leave_button', category: 'buttons', description: 'Ayrıl butonu' },
            { key: 'info_button', category: 'buttons', description: 'Bilgi butonu' },

            // Mesajlar
            { key: 'joined_giveaway', category: 'messages', description: 'Katılım mesajı' },
            { key: 'left_giveaway', category: 'messages', description: 'Ayrılma mesajı' },
            { key: 'good_luck', category: 'messages', description: 'İyi şanslar mesajı' },
            { key: 'no_winner', category: 'messages', description: 'Kazanan yok mesajı' },
            { key: 'already_joined', category: 'messages', description: 'Zaten katıldın mesajı' },

            // Footer
            { key: 'footer_join', category: 'footer', description: 'Katılım footer mesajı' },

            // DM
            { key: 'dm_winner_title', category: 'dm', description: 'Kazanan DM başlığı' },
            { key: 'dm_claim', category: 'dm', description: 'Ödül alma mesajı' }
        ];
    }

    // Kategori listesini al
    static getCategories() {
        return [
            { id: 'titles', name: 'Başlıklar', emoji: '📌' },
            { id: 'info', name: 'Bilgi Etiketleri', emoji: 'ℹ️' },
            { id: 'buttons', name: 'Butonlar', emoji: '🔘' },
            { id: 'messages', name: 'Mesajlar', emoji: '💬' },
            { id: 'footer', name: 'Footer', emoji: '📝' },
            { id: 'dm', name: 'DM Mesajları', emoji: '📨' }
        ];
    }
}

module.exports = {
    LanguageManager,
    languages
};
