const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('delete')
        .setDescription('Bir çekilişi tamamen sil')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Çekiliş ID')
                .setRequired(true)
                .setAutocomplete(true)),

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

        const giveawayId = interaction.options.getString('id');
        await interaction.deferReply({ ephemeral: true });

        const result = await giveawayManager.deleteGiveaway(giveawayId);

        if (result.success) {
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.giveaway_deleted, `\`${giveawayId}\``)]
            });
        } else {
            // Hata mesajını dil dosyasından almaya çalış, yoksa gelen reason'ı kullan
            const reason = lang[result.reason] || result.reason || lang.error;
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, reason)]
            });
        }
    }
};
