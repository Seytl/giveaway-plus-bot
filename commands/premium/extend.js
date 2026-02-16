const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager, readJSON, writeJSON, PREMIUM_FILE } = require('../../utils/database');
const { Colors, Emojis } = require('../../utils/constants');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('extend')
        .setDescription('Mevcut premium süresini uzat (Bot sahibi)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Premium türü')
                .setRequired(true)
                .addChoices(
                    { name: 'Sunucu', value: 'server' },
                    { name: 'Kullanıcı', value: 'user' }
                ))
        .addStringOption(option =>
            option.setName('target_id')
                .setDescription('Sunucu veya kullanıcı ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Eklenecek süre')
                .setRequired(true)
                .addChoices(
                    { name: '1 Hafta', value: '7d' },
                    { name: '1 Ay', value: '30d' },
                    { name: '3 Ay', value: '90d' },
                    { name: '6 Ay', value: '180d' },
                    { name: '1 Yıl', value: '365d' }
                )),

    async execute(interaction) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Sadece bot sahibi kullanabilir
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.owner_only)],
                ephemeral: true
            });
        }

        const type = interaction.options.getString('type');
        const targetId = interaction.options.getString('target_id');
        const duration = interaction.options.getString('duration');

        // Mevcut premium kontrol
        let isPremium, premiumInfo;
        if (type === 'server') {
            isPremium = PremiumManager.isServerPremium(targetId);
            premiumInfo = PremiumManager.getServerPremium(targetId);
        } else {
            isPremium = PremiumManager.isUserPremium(targetId);
            premiumInfo = PremiumManager.getUserPremium(targetId);
        }

        if (!isPremium || !premiumInfo) {
            return interaction.reply({
                embeds: [GiveawayEmbeds.createErrorEmbed(lang.error, lang.premium_not_found)],
                ephemeral: true
            });
        }

        if (premiumInfo.expires === 'lifetime') {
            return interaction.reply({
                embeds: [GiveawayEmbeds.createInfoEmbed(lang.info, lang.already_lifetime)],
                ephemeral: true
            });
        }

        // Süreyi hesapla
        const days = parseInt(duration);
        const durationMs = days * 24 * 60 * 60 * 1000;

        // Premium uzat
        let result;
        if (type === 'server') {
            result = PremiumManager.addServerPremium(targetId, durationMs, interaction.user.id);
        } else {
            result = PremiumManager.addUserPremium(targetId, durationMs, interaction.user.id);
        }

        let targetName;
        if (type === 'server') {
            try {
                const guild = await interaction.client.guilds.fetch(targetId).catch(() => null);
                targetName = guild ? guild.name : targetId;
            } catch {
                targetName = targetId;
            }
        } else {
            try {
                const user = await interaction.client.users.fetch(targetId).catch(() => null);
                targetName = user ? user.tag : targetId;
            } catch {
                targetName = targetId;
            }
        }

        const newExpiresText = `<t:${Math.floor(new Date(result.expires).getTime() / 1000)}:F>`;

        const embed = new EmbedBuilder()
            .setTitle(`${Emojis.CHECK} ${lang.premium_extended}`)
            .setColor(Colors.SUCCESS)
            .setDescription(`${Emojis.ARROW} **${lang.type}:** ${type === 'server' ? lang.server : lang.user}
${Emojis.ARROW} **${lang.target}:** ${targetName}
${Emojis.ARROW} **ID:** \`${targetId}\`
${Emojis.CLOCK} **${lang.added_time}:** ${days} ${lang.days}
${Emojis.CALENDAR} **${lang.new_expiry}:** ${newExpiresText}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
