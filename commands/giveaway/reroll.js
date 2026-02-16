const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('reroll')
        .setDescription('Bitmiş çekilişte yeniden kazanan seç')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Çekiliş ID')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Yeniden seçilecek kazanan sayısı (varsayılan: 1)')
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Yetki kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [GiveawayEmbeds.createErrorEmbed(lang.permission_error, lang.manage_server_required)],
                ephemeral: true
            });
        }

        const giveawayId = interaction.options.getString('id');
        const count = interaction.options.getInteger('count') || 1;
        await interaction.deferReply({ ephemeral: true });

        const result = await giveawayManager.reroll(giveawayId, count);

        if (result.success) {
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.rerolled, `${lang.new_winners}: ${result.winners.map(w => `<@${w}>`).join(', ')}`)]
            });
        } else {
            // Hata mesajını dil dosyasından almaya çalış
            const reason = lang[result.reason] || result.reason || lang.error;
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, reason)]
            });
        }
    }
};
