const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { parseTime, formatDuration } = require('../../utils/time');
const { Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('start')
        .setDescription('Yeni bir çekiliş başlat')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Çekiliş süresi (örn: 1d 2h 30m, 1g 2sa 30dk)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Çekiliş ödülü')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Kazanan sayısı (varsayılan: 1)')
                .setMinValue(1)
                .setMaxValue(50))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Çekiliş kanalı (varsayılan: mevcut kanal)'))
        .addRoleOption(option =>
            option.setName('required_role')
                .setDescription('Katılım için gerekli rol'))
        .addRoleOption(option =>
            option.setName('bonus_role')
                .setDescription('Bonus giriş hakkı veren rol'))
        .addIntegerOption(option =>
            option.setName('bonus_amount')
                .setDescription('Bonus rol için ek giriş sayısı')
                .setMinValue(1)
                .setMaxValue(10))
        .addIntegerOption(option =>
            option.setName('account_age')
                .setDescription('Minimum Discord hesap yaşı (gün)')
                .setMinValue(1)
                .setMaxValue(365))
        .addIntegerOption(option =>
            option.setName('server_age')
                .setDescription('Minimum sunucu üyelik süresi (gün)')
                .setMinValue(1)
                .setMaxValue(365))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Çekiliş görseli URL (thumbnail)'))
        .addIntegerOption(option =>
            option.setName('min_messages')
                .setDescription('Minimum mesaj sayısı')
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('survey_question')
                .setDescription('Anket sorusu (Katılım için cevaplanmalı)')),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Yetki kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.manage_server_required)],
                ephemeral: true
            });
        }

        const { options } = interaction;
        const duration = parseTime(options.getString('duration'));

        if (duration < 10000) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.invalid_duration, lang.min_duration_error)],
                ephemeral: true
            });
        }

        const { PremiumManager } = require('../../utils/database');
        const { VoteManager } = require('../../utils/voteManager');
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

        const isServerPremium = PremiumManager.isServerPremium(interaction.guildId);
        const isUserPremium = PremiumManager.isUserPremium(interaction.user.id);
        const isPremium = isServerPremium || isUserPremium;

        // 🗳️ Top.gg Oy Kontrolü (Premium yoksa)
        if (!isPremium && VoteManager.isEnabled()) {
            const hasVoted = await VoteManager.hasVoted(interaction.user.id);

            if (!hasVoted) {
                const voteEmbed = GiveawayComponentsV2.createWarningEmbed(
                    lang.vote_required_title || '🗳️ Oy Gerekli!',
                    (lang.vote_required_desc || 'You need to vote for the bot on **Top.gg** to start a giveaway!\n\nTry again after voting. Premium users can bypass this requirement.').replace('{bot}', interaction.client.user.username)
                );

                const voteButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel(lang.vote_button || '🗳️ Oy Ver')
                            .setStyle(ButtonStyle.Link)
                            .setURL(VoteManager.getVoteUrl()),
                        new ButtonBuilder()
                            .setLabel(lang.premium_button || '⭐ Premium Al')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/qaNsZcBw8d') // Destek sunucusu linki
                    );

                return interaction.reply({
                    embeds: [voteEmbed],
                    components: [voteButton],
                    ephemeral: true
                });
            }
        }

        // Limitler
        const LIMITS = {
            MAX_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 gün
            MAX_WINNERS: 10,
            MAX_COUNT: 5
        };

        if (!isPremium) {
            // Süre limiti kontrolü
            if (duration > LIMITS.MAX_DURATION) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.premium, lang.premium_duration_error || 'Premium üyeliğiniz veya sunucu premium\'u olmadığı için maksimum 7 günlük çekiliş başlatabilirsiniz.')],
                    ephemeral: true
                });
            }
            // Kazanan sayısı limiti kontrolü
            if (winnerCount > LIMITS.MAX_WINNERS) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.premium, lang.premium_winner_limit_error || 'Premium üyeliğiniz veya sunucu premium\'u olmadığı için maksimum 10 kazanan seçebilirsiniz.')],
                    ephemeral: true
                });
            }

            // Aktif çekiliş sayısı limiti kontrolü
            const activeGiveaways = giveawayManager.getActiveGiveaways(interaction.guildId);
            if (activeGiveaways.length >= LIMITS.MAX_COUNT) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.premium, lang.premium_count_limit_error || 'Premium üyeliğiniz veya sunucu premium\'u olmadığı için aynı anda maksimum 5 aktif çekiliş oluşturabilirsiniz.')],
                    ephemeral: true
                });
            }
        }

        const prize = options.getString('prize');
        const winnerCount = options.getInteger('winners') || 1;
        const channel = options.getChannel('channel') || interaction.channel;
        const requiredRole = options.getRole('required_role');
        const bonusRole = options.getRole('bonus_role');
        const bonusAmount = options.getInteger('bonus_amount') || 1;
        const accountAge = options.getInteger('account_age');
        const serverAge = options.getInteger('server_age');
        const image = options.getString('image');

        await interaction.deferReply({ ephemeral: true });

        try {
            const giveawayOptions = {
                guildId: interaction.guildId,
                channelId: channel.id,
                hostId: interaction.user.id,
                prize: prize,
                winnerCount: winnerCount,
                duration: duration,
                image: image,
                requirements: {},
                bonusEntries: []
            };

            // Şartları ekle
            if (requiredRole) {
                giveawayOptions.requirements.roles = [requiredRole.id];
            }
            if (accountAge) {
                giveawayOptions.requirements.accountAge = accountAge;
            }
            if (serverAge) {
                giveawayOptions.requirements.serverAge = serverAge;
            }
            if (options.getInteger('min_messages')) {
                giveawayOptions.requirements.minMessages = options.getInteger('min_messages');
            }
            if (options.getString('survey_question')) {
                giveawayOptions.surveyQuestion = options.getString('survey_question');
                giveawayOptions.type = 'SURVEY';
            }

            // Bonus giriş ekle
            if (bonusRole) {
                giveawayOptions.bonusEntries.push({
                    roleId: bonusRole.id,
                    entries: bonusAmount
                });
            }

            const giveaway = await giveawayManager.create(giveawayOptions);

            const successEmbed = GiveawayComponentsV2.createSuccessEmbed(
                lang.giveaway_started_title,
                `
${Emojis.GIFT} **${lang.prize}:** ${prize}
${Emojis.CLOCK} **${lang.duration}:** ${formatDuration(duration)}
${Emojis.TROPHY} **${lang.winner_count}:** ${winnerCount} ${lang.users || 'users'}
${Emojis.ARROW} **${lang.channel}:** <#${channel.id}>
${Emojis.INFO} **${lang.giveaway_id}:** \`${giveaway.id}\`
                `
            );

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('[GIVEAWAY] Başlatma hatası:', error);
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.command_error)]
            });
        }
    }
};
