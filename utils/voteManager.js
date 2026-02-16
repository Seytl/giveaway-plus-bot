/**
 * Top.gg Vote Manager
 * Kullanıcının son 12 saat içinde oy verip vermediğini kontrol eder
 */

const config = require('../config.json');

class VoteManager {
    static cache = new Map(); // userId -> { voted: boolean, timestamp: number }
    static CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache

    /**
     * Kullanıcının son 12 saat içinde oy verip vermediğini kontrol eder
     * @param {string} userId - Discord kullanıcı ID'si
     * @returns {Promise<boolean>} - Oy verdiyse true
     */
    static async hasVoted(userId) {
        // Top.gg devre dışıysa her zaman true döndür
        if (!config.topgg || !config.topgg.enabled || !config.topgg.token || config.topgg.token === 'YOUR_TOPGG_TOKEN_HERE') {
            return true;
        }

        // Cache kontrolü
        const cached = this.cache.get(userId);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.voted;
        }

        try {
            const response = await fetch(`https://top.gg/api/bots/${config.topgg.botId}/check?userId=${userId}`, {
                headers: {
                    'Authorization': config.topgg.token
                }
            });

            if (!response.ok) {
                console.error('[TOPGG] API Hatası:', response.status);
                return true; // API hatası durumunda geçiş izni ver
            }

            const data = await response.json();
            const voted = data.voted === 1;

            // Cache'e kaydet
            this.cache.set(userId, {
                voted: voted,
                timestamp: Date.now()
            });

            return voted;
        } catch (error) {
            console.error('[TOPGG] Oy kontrolü hatası:', error.message);
            return true; // Hata durumunda geçiş izni ver
        }
    }

    /**
     * Oy verme URL'ini döndürür
     * @returns {string}
     */
    static getVoteUrl() {
        return config.topgg?.voteUrl || `https://top.gg/bot/${config.clientId}/vote`;
    }

    /**
     * Top.gg entegrasyonunun aktif olup olmadığını kontrol eder
     * @returns {boolean}
     */
    static isEnabled() {
        return config.topgg?.enabled && config.topgg?.token && config.topgg.token !== 'YOUR_TOPGG_TOKEN_HERE';
    }

    /**
     * Cache'i temizle
     */
    static clearCache() {
        this.cache.clear();
    }
}

module.exports = { VoteManager };
