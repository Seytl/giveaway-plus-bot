const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager } = require('../../utils/database');
const { Colors, Emojis } = require('../../utils/constants');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('check')
        .setDescription('Belirli bir sunucu veya kullanıcının premium durumunu kontrol et (Bot sahibi)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Kontrol türü')
                .setRequired(true)
                .addChoices(
                    { name: 'Sunucu', value: 'server' },
                    { name: 'Kullanıcı', value: 'user' }
                ))
        .addStringOption(option =>
            option.setName('target_id')
                .setDescription('Sunucu veya kullanıcı ID')
                .setRequired(true)),

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

        let isPremium, premiumInfo, targetName;

        if (type === 'server') {
            isPremium = PremiumManager.isServerPremium(targetId);
            premiumInfo = PremiumManager.getServerPremium(targetId);
            try {
                const guild = await interaction.client.guilds.fetch(targetId).catch(() => null);
                targetName = guild ? guild.name : lang.unknown;
            } catch {
                targetName = lang.unknown;
            }
        } else {
            isPremium = PremiumManager.isUserPremium(targetId);
            premiumInfo = PremiumManager.getUserPremium(targetId);
            try {
                const user = await interaction.client.users.fetch(targetId).catch(() => null);
                targetName = user ? user.tag : lang.unknown;
            } catch {
                targetName = lang.unknown;
            }
        }

        let embed;

        if (isPremium && premiumInfo) {
            const expiresText = premiumInfo.expires === 'lifetime'
                ? `♾️ ${lang.lifetime}`
                : `<t:${Math.floor(new Date(premiumInfo.expires).getTime() / 1000)}:R>`;

            embed = new EmbedBuilder()
                .setTitle(`${Emojis.DIAMOND} ${lang.premium_status}`)
                .setColor(Colors.SUCCESS)
                .setDescription(`${Emojis.CHECK} **${lang.premium_active}!**

${Emojis.ARROW} **${lang.type}:** ${type === 'server' ? lang.server : lang.user}
${Emojis.ARROW} **${lang.name}:** ${targetName}
${Emojis.ARROW} **ID:** \`${targetId}\`
${Emojis.CLOCK} **${lang.ends_at}:** ${expiresText}
${Emojis.CALENDAR} **${lang.added_at}:** <t:${Math.floor(new Date(premiumInfo.addedAt).getTime() / 1000)}:F>
${Emojis.CROWN} **${lang.added_by}:** <@${premiumInfo.addedBy}>`)
                .setTimestamp();
        } else {
            embed = new EmbedBuilder()
                .setTitle(`${Emojis.CROSS} ${lang.premium_status}`)
                .setColor(Colors.ERROR)
                .setDescription(`${Emojis.WARNING} **${lang.premium_not_active}**

${Emojis.ARROW} **${lang.type}:** ${type === 'server' ? lang.server : lang.user}
${Emojis.ARROW} **${lang.name}:** ${targetName}
${Emojis.ARROW} **ID:** \`${targetId}\`

${lang.premium_not_found_desc || 'Premium bulunamadı.'}`)
                .setTimestamp();
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
