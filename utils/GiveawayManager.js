const { AttachmentBuilder } = require('discord.js');
const { readJSON, writeJSON, GIVEAWAYS_FILE, BLACKLIST_FILE, HISTORY_FILE, STATS_FILE } = require('./database');
const { GiveawayComponentsV2 } = require('./componentsV2');
const { Colors, Emojis } = require('./constants');
const { LanguageManager } = require('./languageManager');
const { CanvasManager } = require('./canvasManager');
const { AntiCheat } = require('./antiCheat');

// Çekiliş Yöneticisi
class GiveawayManager {
    constructor(client) {
        this.client = client;
        this.giveaways = new Map();
        this.timers = new Map();
        this.masterLoop = null;
        this.startMasterLoop();
        this.load();
    }

    load() {
        const data = readJSON(GIVEAWAYS_FILE, { giveaways: [] });
        data.giveaways.forEach(g => {
            // Veri bütünlüğünü sağla
            g.winners = g.winners || [];
            g.participants = g.participants || [];
            g.bonusEntries = g.bonusEntries || [];
            g.paused = g.paused || false; // Pause desteği
            g.remainingTime = g.remainingTime || 0;
            g.type = g.type || 'NORMAL'; // DROP vs NORMAL

            this.giveaways.set(g.id, g);

            // Eğer duraklatılmışsa timer kurma
            if (!g.ended && !g.paused && new Date(g.endTime) > Date.now()) {
                this.scheduleEnd(g);
            } else if (!g.ended && !g.paused) {
                this.endGiveaway(g.id);
            }
        });
        console.log(`[GIVEAWAY] ${this.giveaways.size} giveaways loaded.`);
    }

    save() {
        const data = {
            giveaways: Array.from(this.giveaways.values())
        };
        writeJSON(GIVEAWAYS_FILE, data);
    }

    generateId() {
        return `GW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    async create(options) {
        const id = this.generateId();
        const giveaway = {
            id,
            guildId: options.guildId,
            channelId: options.channelId,
            messageId: null,
            hostId: options.hostId,
            prize: options.prize,
            winnerCount: options.winnerCount || 1,
            startTime: Date.now(),
            endTime: Date.now() + options.duration,
            participants: [],
            winners: [],
            ended: false,
            requirements: options.requirements || null,
            bonusEntries: options.bonusEntries || [],
            image: options.image || null,
            banner: options.banner || null,
            allowedRoles: options.allowedRoles || [],
            deniedRoles: options.deniedRoles || [],
            codes: options.codes || [], // Otomatik kod teslimi için
            messages: options.messages || {},
            type: 'NORMAL',
            paused: false,
            remainingTime: 0
        };

        const lang = LanguageManager.getLang(options.guildId);

        // Canvas Generatörü
        const rawDuration = options.duration;
        const durationText = rawDuration > 86400000 ? `${Math.floor(rawDuration / 86400000)} ${lang.days || 'days'}` :
            rawDuration > 3600000 ? `${Math.floor(rawDuration / 3600000)} ${lang.hours || 'hours'}` :
                `${Math.floor(rawDuration / 60000)} ${lang.minutes || 'minutes'}`;

        const hostUser = await this.client.users.fetch(options.hostId).catch(() => ({ username: 'Unknown' }));
        const imageBuffer = await CanvasManager.generateGiveawayCard(options.prize, durationText, hostUser.username, lang);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'giveaway.png' });

        giveaway.banner = 'attachment://giveaway.png';
        giveaway.image = null;

        // Embed ve buton oluştur
        const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, [], lang);

        const components = GiveawayComponentsV2.getJoinButton(id, lang);

        // Mesaj gönder
        const channel = await this.client.channels.fetch(options.channelId);
        const message = await channel.send({
            content: options.mentionRoles ? options.mentionRoles.map(r => `<@&${r}>`).join(' ') : null,
            embeds: [embed],
            components: [components],
            files: [attachment]
        });

        giveaway.messageId = message.id;
        this.giveaways.set(id, giveaway);
        this.save();

        // Zamanlayıcı başlat
        this.scheduleEnd(giveaway);

        // İstatistik güncelle
        this.updateStats('create');

        return giveaway;
    }

    scheduleEnd(giveaway) {
        // Master loop zaten kontrol edecek, sadece timer'a ekleyip 5 saniye içinde bitecekse hemen bitirelim
        const timeLeft = new Date(giveaway.endTime) - Date.now();

        if (timeLeft <= 0) {
            this.endGiveaway(giveaway.id);
            return;
        }

        // Eğer süre çok kısaysa (10 saniyeden az) hemen interval kuralım
        if (timeLeft < 10000) {
            setTimeout(() => {
                this.endGiveaway(giveaway.id);
            }, timeLeft);
        }
    }

    // Master döngü başlat (Tüm çekilişleri kontrol eder)
    startMasterLoop() {
        if (this.masterLoop) clearInterval(this.masterLoop);

        this.masterLoop = setInterval(() => {
            const now = Date.now();
            this.giveaways.forEach((giveaway) => {
                // Duraklatılmışsa işlem yapma
                if (giveaway.paused) return;

                if (!giveaway.ended && new Date(giveaway.endTime) <= now) {
                    this.endGiveaway(giveaway.id);
                }
            });
        }, 5000); // 5 saniyede bir kontrol (API dostu)
    }

    async endGiveaway(giveawayId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return null;

        giveaway.ended = true;

        // Kazananları seç
        const winners = this.selectWinners(giveaway);
        giveaway.winners = winners;

        const lang = LanguageManager.getLang(giveaway.guildId);

        // Mesajı güncelle
        try {
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            let embed, content, files = [];
            if (winners.length > 0) {
                // Kazanan Kartı Oluştur
                const winnerNames = await Promise.all(winners.map(async w => {
                    const u = await this.client.users.fetch(w).catch(() => ({ username: 'Unknown' }));
                    return u.username;
                }));

                const winnerImageBuffer = await CanvasManager.generateWinnerCard(giveaway.prize, winnerNames.join(', '), lang);
                const attachment = new AttachmentBuilder(winnerImageBuffer, { name: 'winner.png' });

                giveaway.banner = 'attachment://winner.png'; // Banner olarak ayarla
                giveaway.image = null;
                files.push(attachment);

                embed = GiveawayComponentsV2.createWinnerEmbed(giveaway, winners, lang);

                content = `${Emojis.CONFETTI} ${lang.congratulations || 'Congratulations'} ${winners.map(w => `<@${w}>`).join(', ')}! **${giveaway.prize}** ${lang.won || 'you won'}!`;
            } else {
                embed = GiveawayComponentsV2.createNoWinnerEmbed(giveaway, lang);
                content = `${Emojis.WARNING} ${lang.no_winner || 'No winner could be determined due to lack of participation.'}`;
            }

            const components = GiveawayComponentsV2.getEndedButton(giveawayId, lang);

            await message.edit({
                content: content,
                embeds: [embed],
                components: [components],
                files: files
            });

            // Kazananlara DM gönder ve Kod Teslim Et
            for (let i = 0; i < winners.length; i++) {
                const winnerId = winners[i];
                try {
                    const user = await this.client.users.fetch(winnerId);
                    const dmEmbed = GiveawayComponentsV2.createDMEmbed(giveaway, channel.guild.name, giveaway.channelId, lang)
                        .setThumbnail(channel.guild.iconURL({ dynamic: true }));

                    // Kod varsa ekle
                    if (giveaway.codes && giveaway.codes.length > 0 && giveaway.codes[i]) {
                        dmEmbed.addFields({
                            name: `${Emojis.GIFT || '🎁'} ${lang.your_code || 'Secret Code'}`,
                            value: `||\`${giveaway.codes[i]}\`||`,
                            inline: false
                        });
                        dmEmbed.setDescription(`${dmEmbed.data.description}\n\n${lang.code_delivery_msg || 'Your code has been delivered securely! 🔒'}`);
                    }

                    await user.send({ embeds: [dmEmbed] });
                } catch (err) {
                    console.log(`[GIVEAWAY] DM could not be sent: ${winnerId}`);
                }
            }
        } catch (error) {
            console.error(`[GIVEAWAY] Çekiliş sonlandırma hatası: ${error.message}`);
        }

        // Timer'ı temizle
        if (this.timers.has(giveawayId)) {
            clearTimeout(this.timers.get(giveawayId));
            this.timers.delete(giveawayId);
        }

        this.save();

        // Geçmişe ekle
        this.addToHistory(giveaway);

        // İstatistik güncelle
        this.updateStats('end', { winners: winners.length, participants: giveaway.participants.length });

        return giveaway;
    }

    selectWinners(giveaway) {
        const validParticipants = [...giveaway.participants];

        if (validParticipants.length === 0) return [];
        if (validParticipants.length <= giveaway.winnerCount) {
            return validParticipants;
        }

        // Bonus girişleri hesapla
        const entries = [];
        for (const participantId of validParticipants) {
            let entryCount = 1;

            // Bonus giriş kontrolü
            if (giveaway.bonusEntries && giveaway.bonusEntries.length > 0) {
                const guild = this.client.guilds.cache.get(giveaway.guildId);
                const member = guild?.members.cache.get(participantId);

                if (member) {
                    for (const bonus of giveaway.bonusEntries) {
                        if (member.roles.cache.has(bonus.roleId)) {
                            entryCount += bonus.entries;
                        }
                    }
                }
            }

            for (let i = 0; i < entryCount; i++) {
                entries.push(participantId);
            }
        }

        // Select winners (with Anti-Cheat win rate filter)
        const winners = [];
        const shuffled = entries.sort(() => Math.random() - 0.5);

        for (const entry of shuffled) {
            if (!winners.includes(entry) && winners.length < giveaway.winnerCount) {
                // Anti-Cheat: Check if user exceeded daily win limit
                if (AntiCheat.isWinnerEligible(entry)) {
                    winners.push(entry);
                }
            }
            if (winners.length >= giveaway.winnerCount) break;
        }

        // Record wins in Anti-Cheat system
        winners.forEach(w => AntiCheat.recordWin(w));

        return winners;
    }

    async addParticipant(giveawayId, userId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return { success: false, reason: 'Giveaway not found or ended.' };

        // Blacklist check
        const blacklist = readJSON(BLACKLIST_FILE, { users: [] });
        if (blacklist.users.includes(userId)) {
            return { success: false, reason: 'participation_blocked' };
        }

        // Already joined?
        if (giveaway.participants.includes(userId)) {
            return { success: false, reason: 'already_joined', alreadyJoined: true };
        }

        // Anti-Cheat Check
        const antiCheatResult = await AntiCheat.check(this.client, giveaway, userId);
        if (!antiCheatResult.passed) {
            return { success: false, reason: antiCheatResult.reason, flags: antiCheatResult.flags };
        }

        // Requirements check
        if (giveaway.requirements) {
            const check = await this.checkRequirements(giveaway, userId);
            if (!check.passed) {
                return { success: false, reason: check.reason };
            }
        }

        // Add participant
        giveaway.participants.push(userId);
        AntiCheat.trackJoin(userId, giveawayId);
        this.save();

        // Giriş hakkı hesapla
        let entryCount = 1;
        if (giveaway.bonusEntries && giveaway.bonusEntries.length > 0) {
            const guild = this.client.guilds.cache.get(giveaway.guildId);
            const member = guild?.members.cache.get(userId);

            if (member) {
                for (const bonus of giveaway.bonusEntries) {
                    if (member.roles.cache.has(bonus.roleId)) {
                        entryCount += bonus.entries;
                    }
                }
            }
        }

        // Embed güncelle
        try {
            const lang = LanguageManager.getLang(giveaway.guildId);
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, giveaway.participants, lang);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error(`[GIVEAWAY] Embed güncelleme hatası: ${error.message}`);
        }

        return { success: true, entryCount };
    }

    async removeParticipant(giveawayId, userId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return { success: false, reason: 'giveaway_or_ended' };

        const index = giveaway.participants.indexOf(userId);
        if (index === -1) {
            return { success: false, reason: 'not_joined' };
        }

        giveaway.participants.splice(index, 1);
        AntiCheat.trackLeave(userId, giveawayId);
        this.save();

        // Embed güncelle
        try {
            const lang = LanguageManager.getLang(giveaway.guildId);
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, giveaway.participants, lang);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error(`[GIVEAWAY] Embed güncelleme hatası: ${error.message}`);
        }

        return { success: true };
    }

    async checkRequirements(giveaway, userId) {
        const req = giveaway.requirements;
        const guild = this.client.guilds.cache.get(giveaway.guildId);
        const member = await guild?.members.fetch(userId).catch(() => null);

        if (!member) {
            return { passed: false, reason: 'user_not_found' };
        }

        // Rol kontrolü
        if (req.roles && req.roles.length > 0) {
            const hasRole = req.roles.some(roleId => member.roles.cache.has(roleId));
            if (!hasRole) {
                return {
                    passed: false,
                    reason: `missing_roles` // Detaylı mesajı interaction layer'da halletmek daha iyi ama şimdilik burada kalsın
                };
            }
        }

        // Yasaklı rol kontrolü
        if (giveaway.deniedRoles && giveaway.deniedRoles.length > 0) {
            const hasDeniedRole = giveaway.deniedRoles.some(roleId => member.roles.cache.has(roleId));
            if (hasDeniedRole) {
                return { passed: false, reason: 'denied_role' };
            }
        }

        // Hesap yaşı kontrolü
        if (req.accountAge) {
            const accountAge = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
            if (accountAge < req.accountAge) {
                return {
                    passed: false,
                    reason: `account_age_error`
                };
            }
        }

        // Sunucu üyelik yaşı kontrolü
        if (req.serverAge) {
            const serverAge = (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24);
            if (serverAge < req.serverAge) {
                return {
                    passed: false,
                    reason: `server_age_error`
                };
            }
        }

        // Mesaj sayısı kontrolü
        if (req.minMessages) {
            const { MessageManager } = require('./messageManager');
            const userMessages = MessageManager.getMessageCount(giveaway.guildId, userId);
            if (userMessages < req.minMessages) {
                return {
                    passed: false,
                    reason: `messages_required` // Requires translation key support or fallback
                };
            }
        }

        return { passed: true };
    }

    async reroll(giveawayId, winnerCount = 1) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway) return { success: false, reason: 'giveaway_not_found' };
        if (!giveaway.ended) return { success: false, reason: 'giveaway_not_ended' };

        const lang = LanguageManager.getLang(giveaway.guildId);

        // Önceki kazananları hariç tut
        const validParticipants = giveaway.participants.filter(p => !giveaway.winners.includes(p));

        if (validParticipants.length === 0) {
            return { success: false, reason: 'no_reroll_participants' };
        }

        // Yeni kazananları seç
        const newWinners = [];
        const shuffled = validParticipants.sort(() => Math.random() - 0.5);

        for (const entry of shuffled) {
            if (!newWinners.includes(entry) && newWinners.length < winnerCount) {
                newWinners.push(entry);
            }
            if (newWinners.length >= winnerCount) break;
        }

        giveaway.winners.push(...newWinners);
        this.save();

        // Mesaj gönder
        try {
            const channel = await this.client.channels.fetch(giveaway.channelId);

            const embed = GiveawayComponentsV2.createRerollEmbed(giveaway, newWinners, lang);

            await channel.send({
                content: `${Emojis.TADA} ${lang.congratulations} ${newWinners.map(w => `<@${w}>`).join(', ')}!`,
                embeds: [embed]
            });

            // Kazananlara DM gönder
            for (const winnerId of newWinners) {
                try {
                    const user = await this.client.users.fetch(winnerId);
                    await user.send({ embeds: [embed] });
                } catch (err) {
                    console.log(`[GIVEAWAY] DM could not be sent: ${winnerId}`);
                }
            }
        } catch (error) {
            console.error(`[GIVEAWAY] Reroll mesaj hatası: ${error.message}`);
        }

        return { success: true, winners: newWinners };
    }

    async editGiveaway(giveawayId, options) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return { success: false, reason: 'giveaway_or_ended' };

        // Update fields if provided
        if (options.newPrize) giveaway.prize = options.newPrize;
        if (options.newWinnerCount) giveaway.winnerCount = options.newWinnerCount;

        if (options.addTime) {
            giveaway.endTime += options.addTime;
            // Update remaining time if paused
            if (giveaway.paused) {
                giveaway.remainingTime += options.addTime;
            } else {
                // Reschedule end if active
                this.scheduleEnd(giveaway);
            }
        }

        this.save();

        // Update Embed
        try {
            const lang = LanguageManager.getLang(giveaway.guildId);
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            // Re-generate banner if prize changed (optional, expensive operation so maybe skip for now or implement later)
            // For now just update the embed text

            const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, giveaway.participants, lang);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error(`[EDIT] Embed update error: ${error.message}`);
            return { success: false, reason: 'embed_update_error' };
        }

        return { success: true };
    }

    async deleteGiveaway(giveawayId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway) return { success: false, reason: 'giveaway_not_found' };

        // Timer'ı temizle
        if (this.timers.has(giveawayId)) {
            clearTimeout(this.timers.get(giveawayId));
            this.timers.delete(giveawayId);
        }

        // Mesajı sil
        try {
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            await message.delete();
        } catch (error) {
            console.log(`[GIVEAWAY] Message could not be deleted: ${error.message}`);
        }

        this.giveaways.delete(giveawayId);
        this.save();

        return { success: true };
    }

    getActiveGiveaways(guildId = null) {
        const active = [];
        for (const [id, giveaway] of this.giveaways) {
            if (!giveaway.ended && (!guildId || giveaway.guildId === guildId)) {
                active.push(giveaway);
            }
        }
        return active;
    }

    getGiveaway(giveawayId) {
        return this.giveaways.get(giveawayId);
    }

    addToHistory(giveaway) {
        const history = readJSON(HISTORY_FILE, { giveaways: [] });
        history.giveaways.unshift({
            id: giveaway.id,
            prize: giveaway.prize,
            hostId: giveaway.hostId,
            guildId: giveaway.guildId,
            channelId: giveaway.channelId,
            winnerCount: giveaway.winnerCount,
            winners: giveaway.winners,
            participants: giveaway.participants,
            startTime: giveaway.startTime,
            endTime: giveaway.endTime
        });

        // Son 100 çekilişi tut
        if (history.giveaways.length > 100) {
            history.giveaways = history.giveaways.slice(0, 100);
        }

        writeJSON(HISTORY_FILE, history);
    }

    getHistory(guildId = null, limit = 10) {
        const history = readJSON(HISTORY_FILE, { giveaways: [] });
        let filtered = history.giveaways;

        if (guildId) {
            filtered = filtered.filter(g => g.guildId === guildId);
        }

        return filtered.slice(0, limit);
    }

    updateStats(action, data = {}) {
        const stats = readJSON(STATS_FILE, {
            totalGiveaways: 0,
            completedGiveaways: 0,
            activeGiveaways: 0,
            totalParticipations: 0,
            totalWinners: 0,
            totalPrizes: 0,
            mostPopular: null,
            topWinner: null,
            winnerStats: {}
        });

        switch (action) {
            case 'create':
                stats.totalGiveaways++;
                stats.activeGiveaways++;
                break;
            case 'end':
                stats.completedGiveaways++;
                stats.activeGiveaways = Math.max(0, stats.activeGiveaways - 1);
                stats.totalParticipations += data.participants || 0;
                stats.totalWinners += data.winners || 0;
                stats.totalPrizes++;

                // En popüler çekilişi güncelle
                if (!stats.mostPopular || data.participants > stats.mostPopular.participants) {
                    stats.mostPopular = {
                        participants: data.participants
                    };
                }
                break;
        }

        writeJSON(STATS_FILE, stats);
    }

    getStats(guildId = null) {
        return readJSON(STATS_FILE, {
            totalGiveaways: 0,
            completedGiveaways: 0,
            activeGiveaways: this.getActiveGiveaways(guildId).length,
            totalParticipations: 0,
            totalWinners: 0,
            totalPrizes: 0,
            mostPopular: null,
            topWinner: null
        });
    }
    // --- YENİ ÖZELLİKLER ---

    async createDrop(options) {
        const id = this.generateId();
        const giveaway = {
            id,
            guildId: options.guildId,
            channelId: options.channelId,
            messageId: null,
            hostId: options.hostId,
            prize: options.prize,
            winnerCount: 1, // Drop tek kazananlıdır
            startTime: Date.now(),
            endTime: Date.now() + (options.duration || 600000), // Varsayılan 10dk
            participants: [],
            winners: [],
            ended: false,
            type: 'DROP',
            paused: false,
            remainingTime: 0,
            image: options.image || null
        };

        const lang = LanguageManager.getLang(options.guildId);

        // Drop Embed
        const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, [], lang);

        // Claim Butonu
        const components = GiveawayComponentsV2.getDropButton(id, lang);

        const channel = await this.client.channels.fetch(options.channelId);
        const message = await channel.send({
            content: `${Emojis.GIFT} **DROP!** ${lang.drop_desc || 'First to click wins!'}`,
            embeds: [embed],
            components: [components]
        });

        giveaway.messageId = message.id;
        this.giveaways.set(id, giveaway);
        this.save();
        this.scheduleEnd(giveaway);

        return giveaway;
    }

    async claimDrop(giveawayId, userId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return { success: false, reason: 'giveaway_or_ended' };
        if (giveaway.type !== 'DROP') return { success: false, reason: 'not_drop' };
        if (giveaway.paused) return { success: false, reason: 'paused' };

        // Kazananı belirle
        giveaway.winners = [userId];
        giveaway.ended = true;
        giveaway.participants.push(userId); // Katılımcı olarak ekle

        const lang = LanguageManager.getLang(giveaway.guildId);

        // Mesajı güncelle
        try {
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);

            const embed = GiveawayComponentsV2.createSuccessEmbed(
                lang.drop_claimed || 'Drop Claimed!',
                `${Emojis.TROPHY} ${lang.drop_winner}: <@${userId}>\n${Emojis.GIFT} ${lang.prize}: **${giveaway.prize}**`
            );

            // Butonu pasif yap
            const components = GiveawayComponentsV2.getEndedButton(giveawayId, lang);

            await message.edit({
                content: `<@${userId}> ${lang.won || 'won the drop!'}`,
                embeds: [embed],
                components: [] // Butonları kaldırabiliriz veya ended gösterebiliriz
            });

        } catch (error) {
            console.error(`[DROP] Claim hatası: ${error.message}`);
        }

        this.save();
        this.addToHistory(giveaway);
        this.updateStats('end', { winners: 1, participants: 1 });

        return { success: true };
    }

    async pauseGiveaway(giveawayId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return { success: false, reason: 'giveaway_or_ended' };
        if (giveaway.paused) return { success: false, reason: 'already_paused' };

        giveaway.paused = true;
        giveaway.remainingTime = new Date(giveaway.endTime).getTime() - Date.now();

        // Embed güncelle
        try {
            const lang = LanguageManager.getLang(giveaway.guildId);
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, giveaway.participants, lang);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error(`[PAUSE] Embed hatası: ${error.message}`);
        }

        this.save();
        return { success: true };
    }

    async resumeGiveaway(giveawayId) {
        const giveaway = this.giveaways.get(giveawayId);
        if (!giveaway || giveaway.ended) return { success: false, reason: 'giveaway_or_ended' };
        if (!giveaway.paused) return { success: false, reason: 'not_paused' };

        giveaway.paused = false;
        giveaway.endTime = Date.now() + giveaway.remainingTime;
        giveaway.remainingTime = 0;

        // Embed güncelle
        try {
            const lang = LanguageManager.getLang(giveaway.guildId);
            const channel = await this.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId);
            const embed = GiveawayComponentsV2.createGiveawayEmbed(giveaway, giveaway.participants, lang);
            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error(`[RESUME] Embed hatası: ${error.message}`);
        }

        this.save();
        this.scheduleEnd(giveaway); // Yeniden zamanla (master loop yakalar ama kısa süreliyse önemli)

        return { success: true };
    }
}

module.exports = {
    GiveawayManager
};
