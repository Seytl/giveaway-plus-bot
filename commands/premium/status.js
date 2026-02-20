const { SlashCommandSubcommandBuilder, EmbedBuilder , MessageFlags } = require('discord.js');
const { PremiumManager } = require('../../utils/database');
const { Colors, Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('status')
        .setDescription('Sunucunun premium durumunu kontrol et'),

    async execute(interaction) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const isPremium = PremiumManager.isServerPremium(interaction.guildId);
        const premiumInfo = PremiumManager.getServerPremium(interaction.guildId);
        const features = PremiumManager.getFeatures(isPremium);

        let embed;

        if (isPremium) {
            const expiresText = premiumInfo.expires === 'lifetime'
                ? `♾️ ${lang.lifetime}`
                : `<t:${Math.floor(new Date(premiumInfo.expires).getTime() / 1000)}:R>`;

            embed = new EmbedBuilder()
                .setTitle(`${Emojis.DIAMOND} ${lang.premium_active}`)
                .setColor(Colors.PREMIUM)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setDescription(`${Emojis.CHECK} ${lang.server_is_premium}!

${Emojis.CLOCK} **${lang.ends_at}:** ${expiresText}
${Emojis.CALENDAR} **${lang.added_at}:** <t:${Math.floor(new Date(premiumInfo.addedAt).getTime() / 1000)}:F>

**${Emojis.STAR} ${lang.premium_features}:**
${Emojis.CHECK} ${lang.max_giveaways}: ${features.maxGiveaways}
${Emojis.CHECK} ${lang.max_winners}: ${features.maxWinners}
${Emojis.CHECK} ${lang.max_duration}: 30 ${lang.days}
${Emojis.CHECK} ${lang.feature_scheduled_giveaways}
${Emojis.CHECK} ${lang.feature_requirements}
${Emojis.CHECK} ${lang.feature_dm}
${Emojis.CHECK} ${lang.feature_stats}
${Emojis.CHECK} ${lang.feature_support}`)
                .setFooter({ text: lang.premium_active_footer })
                .setTimestamp();
        } else {
            embed = new EmbedBuilder()
                .setTitle(`${Emojis.LOCK} ${lang.premium_not_active}`)
                .setColor(Colors.WARNING)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setDescription(`${Emojis.WARNING} ${lang.server_is_not_premium}.

**${Emojis.INFO} ${lang.current_limits}:**
${Emojis.ARROW} ${lang.max_giveaways}: ${features.maxGiveaways}
${Emojis.ARROW} ${lang.max_winners}: ${features.maxWinners}
${Emojis.ARROW} ${lang.max_duration}: 7 ${lang.days}

**${Emojis.DIAMOND} ${lang.with_premium}:**
${Emojis.STAR} 50 ${lang.active_giveaways}
${Emojis.STAR} 100 ${lang.winners}
${Emojis.STAR} 30 ${lang.days}
${Emojis.STAR} ${lang.feature_scheduled_giveaways}
${Emojis.STAR} ${lang.feature_dm}
${Emojis.STAR} ${lang.feature_stats}
${Emojis.STAR} ${lang.feature_support}

${lang.buy_premium_info}`)
                .setFooter({ text: lang.buy_premium_footer })
                .setTimestamp();
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
