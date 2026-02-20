const { SlashCommandSubcommandBuilder , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Aktif çekilişleri listele'),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const giveaways = giveawayManager.getActiveGiveaways(interaction.guildId);
        const embed = GiveawayComponentsV2.createListEmbed(giveaways.slice(0, 10), 1, Math.ceil(giveaways.length / 10) || 1, lang);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
