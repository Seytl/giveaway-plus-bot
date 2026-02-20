const fs = require('fs');
const path = require('path');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const { Colors, Emojis } = require('./constants');
const { readJSON, writeJSON } = require('./database');
const config = require('../config.json');

// ═══════════════════════════════════════════
//  ANTI-CHEAT SYSTEM v1.0
//  Ensures fair giveaway participation
// ═══════════════════════════════════════════

const ANTICHEAT_FILE = path.join('./database', 'anticheat.json');

class AntiCheat {
    // ═══════════════════════════════════════════
    //  CONFIGURATION
    // ═══════════════════════════════════════════
    static CONFIG = {
        JOIN_COOLDOWN: 5000,              // 5 seconds between join attempts
        MIN_ACCOUNT_AGE: 7,              // 7 days minimum account age
        MAX_WINS_PER_DAY: 3,             // Max 3 wins per 24 hours
        SPAM_WINDOW: 5 * 60 * 1000,      // 5 minutes
        SPAM_THRESHOLD: 3,               // 3 join/leave cycles in window = spam
        SUSPICIOUS_SCORE_THRESHOLD: 3,   // Score >= 3 = blocked
    };

    // In-memory caches for performance
    static cooldowns = new Map();         // userId -> lastJoinTimestamp
    static joinLeaveLog = new Map();      // `${userId}_${giveawayId}` -> [{action, timestamp}]

    // ═══════════════════════════════════════════
    //  MAIN CHECK (called before addParticipant)
    // ═══════════════════════════════════════════
    static async check(client, giveaway, userId) {
        const flags = [];
        let suspiciousScore = 0;

        // 1. Cooldown Check
        const cooldownResult = this.checkCooldown(userId);
        if (!cooldownResult.passed) {
            return { passed: false, reason: 'anticheat_cooldown', flags: ['COOLDOWN'] };
        }

        // 2. Fetch member data
        const guild = client.guilds.cache.get(giveaway.guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);
        const user = member?.user || await client.users.fetch(userId).catch(() => null);

        if (!user) {
            return { passed: false, reason: 'user_not_found', flags: ['USER_NOT_FOUND'] };
        }

        // 3. Alt Account Detection (Account Age)
        const accountAgeDays = (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24);
        if (accountAgeDays < this.CONFIG.MIN_ACCOUNT_AGE) {
            flags.push('NEW_ACCOUNT');
            suspiciousScore += 2;
        }

        // 4. No Avatar Check (Default PFP = low trust)
        if (!user.avatar) {
            flags.push('NO_AVATAR');
            suspiciousScore += 1;
        }

        // 5. No Banner + No Bio heuristic (very new/empty account)
        if (!user.banner && accountAgeDays < 14) {
            flags.push('EMPTY_PROFILE');
            suspiciousScore += 1;
        }

        // 6. Join/Leave Spam Detection
        const spamResult = this.checkJoinLeaveSpam(userId, giveaway.id);
        if (!spamResult.passed) {
            flags.push('JOIN_LEAVE_SPAM');
            return { passed: false, reason: 'anticheat_spam', flags };
        }

        // 7. Win Rate Limit (checked separately during winner selection too)
        const winResult = this.checkWinRate(userId);
        if (!winResult.passed) {
            flags.push('WIN_LIMIT_REACHED');
            // Don't block participation, but flag it
            suspiciousScore += 1;
        }

        // Score Decision
        if (suspiciousScore >= this.CONFIG.SUSPICIOUS_SCORE_THRESHOLD) {
            // Log suspicious activity
            this.logSuspicious(userId, giveaway.id, giveaway.guildId, flags, suspiciousScore);
            return { passed: false, reason: 'anticheat_suspicious', flags, score: suspiciousScore };
        }

        // Log minor flags (for monitoring, not blocking)
        if (flags.length > 0) {
            this.logSuspicious(userId, giveaway.id, giveaway.guildId, flags, suspiciousScore, false);
        }

        // Set cooldown
        this.cooldowns.set(userId, Date.now());

        return { passed: true, flags, score: suspiciousScore };
    }

    // ═══════════════════════════════════════════
    //  1. COOLDOWN CHECK
    // ═══════════════════════════════════════════
    static checkCooldown(userId) {
        const lastJoin = this.cooldowns.get(userId);
        if (lastJoin && (Date.now() - lastJoin) < this.CONFIG.JOIN_COOLDOWN) {
            const remaining = Math.ceil((this.CONFIG.JOIN_COOLDOWN - (Date.now() - lastJoin)) / 1000);
            return { passed: false, remaining };
        }
        return { passed: true };
    }

    // ═══════════════════════════════════════════
    //  5. JOIN/LEAVE SPAM DETECTION
    // ═══════════════════════════════════════════
    static checkJoinLeaveSpam(userId, giveawayId) {
        const key = `${userId}_${giveawayId}`;
        const log = this.joinLeaveLog.get(key) || [];
        const now = Date.now();

        // Count leave actions within the spam window
        const recentLeaves = log.filter(e => e.action === 'leave' && (now - e.timestamp) < this.CONFIG.SPAM_WINDOW);

        if (recentLeaves.length >= this.CONFIG.SPAM_THRESHOLD) {
            return { passed: false };
        }
        return { passed: true };
    }

    static trackJoin(userId, giveawayId) {
        const key = `${userId}_${giveawayId}`;
        const log = this.joinLeaveLog.get(key) || [];
        log.push({ action: 'join', timestamp: Date.now() });
        this.joinLeaveLog.set(key, log);
    }

    static trackLeave(userId, giveawayId) {
        const key = `${userId}_${giveawayId}`;
        const log = this.joinLeaveLog.get(key) || [];
        log.push({ action: 'leave', timestamp: Date.now() });
        this.joinLeaveLog.set(key, log);
    }

    // ═══════════════════════════════════════════
    //  3. WIN RATE LIMITER
    // ═══════════════════════════════════════════
    static checkWinRate(userId) {
        const data = this.getData();
        const wins = data.wins?.[userId] || [];
        const now = Date.now();
        const recentWins = wins.filter(t => (now - t) < 24 * 60 * 60 * 1000);

        if (recentWins.length >= this.CONFIG.MAX_WINS_PER_DAY) {
            return { passed: false, wins: recentWins.length };
        }
        return { passed: true, wins: recentWins.length };
    }

    static recordWin(userId) {
        const data = this.getData();
        if (!data.wins) data.wins = {};
        if (!data.wins[userId]) data.wins[userId] = [];
        data.wins[userId].push(Date.now());

        // Cleanup: keep only last 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        data.wins[userId] = data.wins[userId].filter(t => t > weekAgo);

        this.saveData(data);
    }

    // Check if winner candidate is eligible (used during winner selection)
    static isWinnerEligible(userId) {
        const result = this.checkWinRate(userId);
        return result.passed;
    }

    // ═══════════════════════════════════════════
    //  4. SUSPICIOUS ACTIVITY LOGGING
    // ═══════════════════════════════════════════
    static logSuspicious(userId, giveawayId, guildId, flags, score, blocked = true) {
        const data = this.getData();
        if (!data.logs) data.logs = [];

        const entry = {
            userId,
            giveawayId,
            guildId,
            flags,
            score,
            blocked,
            timestamp: new Date().toISOString()
        };

        data.logs.push(entry);

        // Keep only last 500 logs
        if (data.logs.length > 500) {
            data.logs = data.logs.slice(-500);
        }

        this.saveData(data);

        // Console log
        const status = blocked ? '🚫 BLOCKED' : '⚠️ FLAGGED';
        console.log(`[ANTI-CHEAT] ${status} | User: ${userId} | Flags: ${flags.join(', ')} | Score: ${score}/${this.CONFIG.SUSPICIOUS_SCORE_THRESHOLD}`);

        // Webhook alert (for blocked actions only)
        if (blocked) {
            this.sendWebhookAlert(entry);
        }
    }

    // ═══════════════════════════════════════════
    //  7. WEBHOOK ALERTS
    // ═══════════════════════════════════════════
    static async sendWebhookAlert(entry) {
        if (!config.webhooks?.errorUrl || config.webhooks.errorUrl === "YOUR_ERROR_WEBHOOK_URL_HERE") return;

        try {
            const webhook = new WebhookClient({ url: config.webhooks.errorUrl });

            const flagDescriptions = {
                'NEW_ACCOUNT': '🆕 Account younger than 7 days',
                'NO_AVATAR': '👤 No profile picture (default avatar)',
                'EMPTY_PROFILE': '📋 Empty profile + new account',
                'JOIN_LEAVE_SPAM': '🔄 Repeated join/leave spam',
                'WIN_LIMIT_REACHED': '🏆 Win limit reached (3/day)',
                'COOLDOWN': '⏱️ Join cooldown active'
            };

            const flagsText = entry.flags.map(f => flagDescriptions[f] || f).join('\n');

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Anti-Cheat Alert')
                .setColor(Colors.ERROR)
                .setDescription(`A user was **${entry.blocked ? 'BLOCKED' : 'FLAGGED'}** by the Anti-Cheat system.`)
                .addFields(
                    { name: '👤 User', value: `<@${entry.userId}> (\`${entry.userId}\`)`, inline: true },
                    { name: '🎉 Giveaway', value: `\`${entry.giveawayId}\``, inline: true },
                    { name: '📊 Suspicion Score', value: `${entry.score}/${this.CONFIG.SUSPICIOUS_SCORE_THRESHOLD}`, inline: true },
                    { name: '🚩 Flags', value: flagsText || 'None', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'Anti-Cheat System v1.0' });

            await webhook.send({ embeds: [embed] });
        } catch (err) {
            console.error('[ANTI-CHEAT] Webhook alert failed:', err.message);
        }
    }

    // ═══════════════════════════════════════════
    //  DATA PERSISTENCE
    // ═══════════════════════════════════════════
    static getData() {
        return readJSON(ANTICHEAT_FILE, { logs: [], wins: {} });
    }

    static saveData(data) {
        writeJSON(ANTICHEAT_FILE, data);
    }

    // ═══════════════════════════════════════════
    //  STATS (for admin commands)
    // ═══════════════════════════════════════════
    static getStats() {
        const data = this.getData();
        const logs = data.logs || [];
        const now = Date.now();
        const last24h = logs.filter(l => (now - new Date(l.timestamp).getTime()) < 24 * 60 * 60 * 1000);

        return {
            totalLogs: logs.length,
            last24h: last24h.length,
            blocked: last24h.filter(l => l.blocked).length,
            flagged: last24h.filter(l => !l.blocked).length,
            topFlags: this.getTopFlags(last24h)
        };
    }

    static getTopFlags(logs) {
        const counts = {};
        logs.forEach(l => {
            l.flags.forEach(f => {
                counts[f] = (counts[f] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }
}

module.exports = { AntiCheat, ANTICHEAT_FILE };
