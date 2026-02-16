const { SlashCommandSubcommandBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager } = require('../../utils/database');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription('Premium özelliklerini ve fiyatlandırmayı görüntüle'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const isPremium = PremiumManager.isServerPremium(interaction.guildId);
        const freeFeatures = PremiumManager.getFeatures(false);
        const premiumFeatures = PremiumManager.getFeatures(true);

        const embed = GiveawayComponentsV2.createPremiumInfoEmbed(
            lang,
            freeFeatures,
            premiumFeatures,
            isPremium,
            interaction.client.user.displayAvatarURL(),
            interaction.guild.iconURL()
        );

        await interaction.editReply({ embeds: [embed] });
    }
};
