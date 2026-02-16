const { SlashCommandSubcommandBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('history')
        .setDescription('Geçmiş çekilişleri görüntüle'),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const history = giveawayManager.getHistory(interaction.guildId, 10);
        const embed = GiveawayComponentsV2.createHistoryEmbed(history, 1, 1, lang);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
