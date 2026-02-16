const { SlashCommandSubcommandBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('stats')
        .setDescription('Sunucu çekiliş istatistikleri'),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const stats = giveawayManager.getStats(interaction.guildId);
        const embed = GiveawayComponentsV2.createStatsEmbed(stats, interaction.guild, lang);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
