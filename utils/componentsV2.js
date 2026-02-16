const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('./embedBuilder');
const { Colors, Emojis } = require('./constants');
const { formatTimestamp, formatFullDate } = require('./time');

class GiveawayComponentsV2 {
    // --- BUTTONS ---
    static getJoinButton(giveawayId, lang, disabled = false) {
        if (!lang) lang = {};
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`giveaway_join_${giveawayId}`)
                    .setLabel(lang.join_button || 'Join Giveaway')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId(`giveaway_info_${giveawayId}`)
                    .setLabel(lang.participants || 'Participants')
                    .setEmoji('👥')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`giveaway_leave_${giveawayId}`)
                    .setLabel(lang.leave_button || 'Leave')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(disabled)
            );
    }

    static getDropButton(giveawayId, lang) {
        if (!lang) lang = {};
        const button = new ButtonBuilder()
            .setCustomId(`giveaway_claim_${giveawayId}`)
            .setLabel(lang.claim_button || 'CLAIM!')
            .setStyle(ButtonStyle.Success)
            .setEmoji(Emojis.GIFT || '🎁');

        return new ActionRowBuilder().addComponents(button);
    }

    static getEndedButton(giveawayId, lang) {
        if (!lang) lang = {};
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`giveaway_ended_${giveawayId}`)
                    .setLabel(lang.ended_button || 'Ended')
                    .setEmoji('🛑')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`giveaway_reroll_${giveawayId}`)
                    .setLabel(lang.reroll_button || 'Reroll')
                    .setEmoji('🔄')
                    .setStyle(ButtonStyle.Primary)
            );
    }

    static getConfirmButtons(actionId) {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirm_${actionId}`)
                    .setLabel('✅ Confirm')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`cancel_${actionId}`)
                    .setLabel('❌ Cancel')
                    .setStyle(ButtonStyle.Danger)
            );
    }

    static getPaginationButtons(currentPage, totalPages, baseId, lang) {
        if (!lang) lang = {};
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${baseId}_first`)
                    .setLabel('⏮️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 1),
                new ButtonBuilder()
                    .setCustomId(`${baseId}_prev`)
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 1),
                new ButtonBuilder()
                    .setCustomId(`${baseId}_page`)
                    .setLabel(`${lang.page || 'Page'} ${currentPage}/${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId(`${baseId}_next`)
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages),
                new ButtonBuilder()
                    .setCustomId(`${baseId}_last`)
                    .setLabel('⏭️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages)
            );
    }

    // --- EMBEDS ---

    static createGiveawayEmbed(giveaway, participants = [], lang) {
        if (!lang) lang = {};

        const endTime = new Date(giveaway.endTime);
        const isEnded = Date.now() > endTime;
        const participantCount = participants.length;

        // Pause/Drop durumu
        let timerText = `<t:${Math.floor(endTime.getTime() / 1000)}:R> (<t:${Math.floor(endTime.getTime() / 1000)}:f>)`;
        if (giveaway.paused) {
            timerText = `**${lang.paused_footer || '⚠️ PAUSED'}**\n${lang.resume_info || 'Waiting for resume...'}`;
        } else if (giveaway.type === 'DROP') {
            timerText = `**${lang.drop_title || '🎁 DROP!'}**`;
        }

        const embed = createEmbed({
            color: giveaway.paused ? Colors.WARNING : (isEnded ? Colors.DARK : Colors.GIVEAWAY),
            title: giveaway.prize,
            author: { name: `🎉 ${lang.giveaway_title || 'GIVEAWAY'} 🎉`, iconURL: 'https://cdn.discordapp.com/emojis/1040269329712398407.webp?size=96&quality=lossless' },
            description: `${lang.premium_description || 'Click the button below to join the giveaway!'}`,
            thumbnail: giveaway.image || null,
            image: giveaway.banner || null,
            fields: [
                { name: `${Emojis.HOST || '👑'} ${lang.sponsor || 'Hosted By'}`, value: `<@${giveaway.hostId}>`, inline: true },
                { name: `${Emojis.TIME || '⏰'} ${lang.ends_at || 'Ends At'}`, value: timerText, inline: true },
                { name: `${Emojis.WINNER || '🏆'} ${lang.winner_count || 'Winners'}`, value: `\`${giveaway.winnerCount}\``, inline: true },
                { name: `${Emojis.PEOPLE || '👥'} ${lang.participants || 'Participants'}`, value: `\`${participantCount}\``, inline: true },
                { name: `${Emojis.STATUS || '📊'} Status`, value: giveaway.paused ? '**PAUSED**' : (isEnded ? '**ENDED**' : '**ACTIVE**'), inline: true }
            ],
            footer: {
                text: `${lang.giveaway_id || 'ID'}: ${giveaway.id} • ${isEnded ? (lang.giveaway_ended || 'Ended') : 'Powered by Anarvion'} • Sponsored by Hostimux.com`,
                iconURL: 'https://i.imgur.com/Dj6zS2o.png'
            }
        });

        // Şartlar varsa ekle (Modern görünüm)
        if (giveaway.requirements && Object.keys(giveaway.requirements).length > 0) {
            const req = giveaway.requirements;
            let reqList = [];
            if (req.roles && req.roles.length > 0) reqList.push(`> ${Emojis.ROLE || '🎭'} Roles: ${req.roles.map(r => `<@&${r}>`).join(', ')}`);
            if (req.serverAge) reqList.push(`> ${Emojis.SERVER || '🏰'} Server Age: \`${req.serverAge}\` ${lang.days || 'days'}`);
            if (req.accountAge) reqList.push(`> ${Emojis.USER || '👤'} Account Age: \`${req.accountAge}\` ${lang.days || 'days'}`);
            if (req.minInvites) reqList.push(`> ${Emojis.INVITE || 'Zw'} Invites: \`${req.minInvites}\``);
            if (req.minLevel) reqList.push(`> ${Emojis.LEVEL || '📊'} Level: \`${req.minLevel}\``);
            if (req.minMessages) reqList.push(`> ${Emojis.LIST || '💬'} Messages: \`${req.minMessages}\``);

            if (reqList.length > 0) {
                embed.addFields({ name: `${Emojis.LOCK || '🔒'} ${lang.requirements || 'Requirements'}`, value: reqList.join('\n'), inline: false });
            }
        }

        // Bonuslar
        if (giveaway.bonusEntries && giveaway.bonusEntries.length > 0) {
            const bonusList = giveaway.bonusEntries.map(b => `> ${Emojis.STAR || '⭐'} <@&${b.roleId}>: +${b.entries}`).join('\n');
            embed.addFields({ name: `${Emojis.BONUS || '✨'} ${lang.bonus_entries || 'Bonus Entries'}`, value: bonusList, inline: false });
        }

        return embed;
    }

    static createWinnerEmbed(giveaway, winners, lang) {
        if (!lang) lang = {};

        const embed = new EmbedBuilder()
            .setColor(Colors.GOLD)
            .setTitle(`${Emojis.TROPHY || '🏆'} ${lang.giveaway_ended || 'GIVEAWAY ENDED'}`)
            .setDescription(`${Emojis.CONFETTI || '🎉'} **${lang.congratulations || 'Congratulations!'}**\n\nThe details of the giveaway result are below.`)
            .addFields(
                { name: `${Emojis.GIFT || '🎁'} ${lang.prize || 'Prize'}`, value: `**${giveaway.prize}**`, inline: true },
                { name: `${Emojis.HOST || '👑'} ${lang.sponsor || 'Hosted By'}`, value: `<@${giveaway.hostId}>`, inline: true },
                { name: `${Emojis.PEOPLE || '👥'} ${lang.participants || 'Total Participants'}`, value: `\`${giveaway.participants.length}\``, inline: true },
                { name: `${Emojis.WINNER || '🏆'} ${lang.winners || 'Winners'}`, value: winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : (lang.no_winner || 'No winners'), inline: false }
            )
            .setThumbnail(giveaway.image || null)
            .setFooter({ text: `${lang.giveaway_id || 'ID'}: ${giveaway.id} • Sponsored by Hostimux.com`, iconURL: 'https://i.imgur.com/Dj6zS2o.png' })
            .setTimestamp();

        return embed;
    }

    static createNoWinnerEmbed(giveaway, lang) {
        if (!lang) lang = {};
        return new EmbedBuilder()
            .setColor(Colors.ERROR)
            .setTitle(`${Emojis.SAD || '😢'} ${lang.giveaway_ended_sad || 'Giveaway Failed'}`)
            .setDescription(`**${lang.prize || 'Prize'}:** ${giveaway.prize}\n${lang.no_winner || 'Not enough participants to determine a winner.'}`)
            .setFooter({ text: `${lang.giveaway_id || 'ID'}: ${giveaway.id} • Sponsored by Hostimux.com` })
            .setTimestamp();
    }

    // Generic Success/Error embeds with V2 style - Polished
    static createSuccessEmbed(title, description) {
        return createEmbed({
            color: Colors.SUCCESS,
            title: `${Emojis.CHECK || '✅'} ${title}`,
            description: description
        });
    }

    static createErrorEmbed(title, description) {
        return createEmbed({
            color: Colors.ERROR,
            title: `${Emojis.CROSS || '❌'} ${title}`,
            description: description
        });
    }

    // Wrapper for compatibility if needed, generic Info
    static createInfoEmbed(title, description) {
        return createEmbed({
            color: Colors.INFO,
            title: `${Emojis.INFO || 'ℹ️'} ${title}`,
            description: description
        });
    }

    // ...other methods like createJoinEmbed can follow similar pattern or just be simplified
    static createJoinEmbed(user, giveaway, entryCount, lang) {
        if (!lang) lang = {};
        return new EmbedBuilder()
            .setColor(Colors.SUCCESS)
            .setAuthor({ name: lang.giveaway_joined || 'Giveaway Joined!', iconURL: 'https://cdn.discordapp.com/emojis/1136236967735165009.webp?size=96&quality=lossless' }) // Party popper/check icon
            .setTitle(giveaway.prize)
            .setDescription(`${Emojis.CHECK || '✅'} **${lang.joined_giveaway || 'Successfully joined the giveaway!'}**\n\n${Emojis.STAR || '⭐'} **${lang.your_entries || 'Your Entries'}:** \`${entryCount}\`\n${Emojis.TIME || '⏰'} **${lang.ends_at}:** <t:${Math.floor(giveaway.endTime / 1000)}:R>`)
            .setFooter({ text: `${lang.good_luck || 'Good luck!'} • Sponsored by Hostimux.com`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
    }

    static createLeaveEmbed(user, giveaway, lang) {
        if (!lang) lang = {};
        return new EmbedBuilder()
            .setColor(Colors.WARNING)
            .setTitle(`${Emojis.DOOR || '🚪'} ${lang.left_giveaway || 'Left Giveaway'}`)
            .setDescription(lang.rejoin_info || 'You can rejoin anytime.')
            .setTimestamp();
    }

    static createListEmbed(giveaways, page, totalPages, lang) {
        const embed = new EmbedBuilder()
            .setColor(Colors.PRIMARY)
            .setTitle(`${Emojis.LIST || '📜'} ${lang.active_giveaways || 'Active Giveaways'}`)
            .setFooter({ text: `${lang.page || 'Page'} ${page}/${totalPages} • Sponsored by Hostimux.com` });

        if (giveaways.length === 0) {
            embed.setDescription(lang.no_active_giveaways || 'No active giveaways.');
            return embed;
        }

        const description = giveaways.map((g, i) => {
            return `\`${i + 1}.\` **${g.prize}**\n• ${Emojis.TIME} ${lang.ends_at}: ${formatTimestamp(new Date(g.endTime), 'R')}\n• ${Emojis.USERS} ${lang.participants}: \`${g.participants?.length || 0}\``;
        }).join('\n\n');

        embed.setDescription(description);
        return embed;
    }

    static createHistoryEmbed(giveaways, page, totalPages, lang) {
        const embed = new EmbedBuilder()
            .setColor(Colors.PRIMARY)
            .setTitle(`${Emojis.HISTORY || 'clock'} ${lang.giveaway_history || 'Giveaway History'}`)
            .setFooter({ text: `${lang.page || 'Page'} ${page}/${totalPages} • Sponsored by Hostimux.com` });

        if (giveaways.length === 0) {
            embed.setDescription(lang.empty_history || 'Giveaway history is empty.');
            return embed;
        }

        const description = giveaways.map((g, i) => {
            const status = g.ended ? (lang.giveaway_ended || 'Ended') : (lang.active || 'Active');
            return `\`${i + 1}.\` **${g.prize}**\n• ${Emojis.TIME} ${lang.ends_at}: ${formatTimestamp(new Date(g.endTime), 'R')}\n• ${Emojis.STATUS || '📊'} ${lang.status}: ${status}`;
        }).join('\n\n');

        embed.setDescription(description);
        return embed;
    }

    static createBlacklistEmbed(list, page, totalPages, lang) {
        const embed = new EmbedBuilder()
            .setColor(Colors.ERROR)
            .setTitle(`${Emojis.BLOCK || '🚫'} ${lang.blacklist_title || 'Blacklist'}`)
            .setFooter({ text: `${lang.page || 'Page'} ${page}/${totalPages} • Sponsored by Hostimux.com` });

        if (list.length === 0) {
            embed.setDescription(lang.empty_blacklist || 'Blacklist is empty.');
            return embed;
        }

        const description = list.map((u, i) => {
            return `\`${i + 1}.\` <@${u.userId}> (${u.userId})\n• ${Emojis.REASON || '❓'} ${lang.reason}: ${u.reason || lang.no_reason}`;
        }).join('\n\n');

        embed.setDescription(description);
        return embed;
    }

    static createPremiumListEmbed(list, page, totalPages, lang) {
        const embed = new EmbedBuilder()
            .setColor(Colors.PREMIUM)
            .setTitle(`${Emojis.DIAMOND || '💎'} ${lang.premium_list || 'Premium List'}`)
            .setFooter({ text: `${lang.page || 'Page'} ${page}/${totalPages} • Sponsored by Hostimux.com` });

        if (list.length === 0) {
            embed.setDescription(lang.none || 'No premium members.');
            return embed;
        }

        const description = list.map((p, i) => {
            const name = p.name ? `**${p.name}** ` : '';
            return `\`${i + 1}.\` ${name}(\`${p.id}\`)\n• ${Emojis.TIME} ${lang.ends_at}: ${p.permanent ? (lang.lifetime || 'Lifetime') : formatTimestamp(new Date(p.expiresAt), 'F')}`;
        }).join('\n\n');

        embed.setDescription(description);
        return embed;
    }

    static createGenericEmbed(title, description, color = Colors.PRIMARY) {
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
    }

    static createStatsEmbed(stats, guild, lang) {
        if (!lang) lang = {};
        return new EmbedBuilder()
            .setTitle(`${Emojis.LEVEL || '📊'} ${lang.giveaway_stats || 'Giveaway Stats'}`)
            .setColor(Colors.PREMIUM)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(`${Emojis.GIVEAWAY || '🎉'} **${lang.total_giveaways || 'Total Giveaways'}:** \`${stats.totalGiveaways || 0}\`
${Emojis.CHECK || '✅'} **${lang.completed || 'Completed'}:** \`${stats.completedGiveaways || 0}\`
${Emojis.HOURGLASS || '⏳'} **${lang.ongoing || 'Ongoing'}:** \`${stats.activeGiveaways || 0}\`
${Emojis.USERS || '👥'} **${lang.total_participations || 'Total Participations'}:** \`${stats.totalParticipations || 0}\`
${Emojis.TROPHY || '🏆'} **${lang.total_winners || 'Total Winners'}:** \`${stats.totalWinners || 0}\`
${Emojis.GIFT || '🎁'} **${lang.distributed_prizes || 'Distributed Prizes'}:** \`${stats.totalPrizes || 0}\`

${Emojis.FIRE || '🔥'} **${lang.most_popular || 'Most Popular'}:**
${stats.mostPopular ? `${stats.mostPopular.prize} - \`${stats.mostPopular.participants}\` ${lang.participants || 'participants'}` : (lang.no_data || 'No data')}

${Emojis.CROWN || '👑'} **${lang.top_winner || 'Top Winner'}:**
${stats.topWinner ? `<@${stats.topWinner.id}> - \`${stats.topWinner.wins}\` ${lang.times || 'times'}` : (lang.no_data || 'No data')}`)
            .setFooter({
                text: `${guild.name} • Sponsored by Hostimux.com`,
                iconURL: guild.iconURL()
            })
            .setTimestamp();
    }

    static createDMEmbed(giveaway, guildName, channelId, lang) {
        return new EmbedBuilder()
            .setTitle(`${Emojis.TROPHY || '🏆'} ${lang.dm_winner_title || 'Congratulations! You Won!'}`)
            .setColor(Colors.GOLD)
            .setDescription(`
${Emojis.GIFT || '🎁'} **${lang.dm_prize || 'Prize'}:** ${giveaway.prize}
${Emojis.ARROW || '➡️'} **${lang.dm_server || 'Server'}:** ${guildName}
${Emojis.ARROW || '➡️'} **${lang.dm_channel || 'Channel'}:** <#${channelId}>

${lang.dm_claim || 'Contact server admins to claim your prize!'}`)
            .setTimestamp();
    }

    static createRerollEmbed(giveaway, newWinners, lang) {
        return new EmbedBuilder()
            .setTitle(`${Emojis.CONFETTI || '🎊'} ${lang.rerolled || 'Rerolled'}!`)
            .setColor(Colors.GOLD)
            .setDescription(`${Emojis.GIFT || '🎁'} **${lang.prize || 'Prize'}:** ${giveaway.prize}\n\n${Emojis.TROPHY || '🏆'} **${lang.new_winners || 'New Winners'}:**\n${newWinners.map((w, i) => `${Emojis.MEDAL || '🏅'} ${i + 1}. <@${w}>`).join('\n')}`)
            .setTimestamp();
    }

    static createPremiumInfoEmbed(lang, freeFeatures, premiumFeatures, isPremium, botIcon, guildIcon) {
        return new EmbedBuilder()
            .setTitle(`${Emojis.DIAMOND || '💎'} ${lang.premium_features_title}`)
            .setColor(Colors.PREMIUM)
            .setThumbnail(botIcon)
            .setDescription(`${Emojis.SPARKLES || '✨'} **Premium**

${lang.premium_description}

${Emojis.CROWN || '👑'} **${lang.why_premium}**
${lang.premium_description}`)
            .addFields([
                {
                    name: `${Emojis.GIFT || '🎁'} ${lang.free_plan}`,
                    value: `${Emojis.ARROW || '➡️'} ${freeFeatures.maxGiveaways} ${lang.active_giveaways}
${Emojis.ARROW || '➡️'} ${freeFeatures.maxWinners} ${lang.winners}
${Emojis.ARROW || '➡️'} 7 ${lang.days} ${lang.max_duration}
${Emojis.ARROW || '➡️'} ${(lang.basic_features || '').replace(/➡️/g, Emojis.ARROW || '➡️')}`,
                    inline: true
                },
                {
                    name: `${Emojis.DIAMOND || '💎'} ${lang.premium_plan}`,
                    value: `${Emojis.CHECK || '✅'} ${lang.feature_code_giveaway || 'Code Giveaway'}
${Emojis.CHECK || '✅'} ${lang.feature_drop || 'Drop'}
${Emojis.CHECK || '✅'} ${lang.feature_templates || 'Templates'}
${Emojis.CHECK || '✅'} ${lang.feature_pause_resume || 'Pause/Resume'}
${Emojis.CHECK || '✅'} ${lang.feature_requirements}
${Emojis.CHECK || '✅'} ${lang.feature_scheduled_giveaways}
${Emojis.CHECK || '✅'} ${lang.feature_dm}
${Emojis.CHECK || '✅'} ${lang.feature_stats}
${Emojis.CHECK || '✅'} ${lang.feature_colors}
${Emojis.CHECK || '✅'} ${lang.feature_support}`,
                    inline: true
                }
            ])
            .addFields([
                {
                    name: `${Emojis.CROWN || '👑'} ${lang.pricing_title}`,
                    value: `
${Emojis.STAR || '⭐'} **1 ${lang.week}:** ~~5$~~ **3$**
${Emojis.STAR || '⭐'} **1 ${lang.month}:** ~~15$~~ **10$**
${Emojis.STAR || '⭐'} **3 ${lang.months}:** ~~40$~~ **25$**
${Emojis.STAR || '⭐'} **6 ${lang.months}:** ~~70$~~ **45$**
${Emojis.STAR || '⭐'} **1 ${lang.year}:** ~~120$~~ **80$**
${Emojis.DIAMOND || '💎'} **${lang.lifetime}:** **150$**

${Emojis.FIRE || '🔥'} *${lang.discount_info}*`,
                    inline: false
                }
            ])
            .addFields([
                {
                    name: `${Emojis.INFO || 'ℹ️'} ${lang.how_to_buy_title}`,
                    value: lang.how_to_buy_content,
                    inline: false
                }
            ])
            .setFooter({
                text: `${isPremium ? `✅ ${lang.server_is_premium}` : `❌ ${lang.server_is_not_premium}`} • Sponsored by Hostimux.com`,
                iconURL: guildIcon
            })
            .setTimestamp();
    }

    static createAnnouncementEmbed(title, description, image, color = Colors.PRIMARY) {
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${Emojis.MEGAPHONE || '📢'} ${title}`)
            .setDescription(description)
            .setTimestamp();

        if (image) {
            embed.setImage(image);
        }

        return embed;
    }
}

module.exports = { GiveawayComponentsV2 };
