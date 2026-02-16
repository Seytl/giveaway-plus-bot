const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('resume')
        .setDescription('Çekilişi devam ettir')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Çekiliş ID')
                .setAutocomplete(true)
                .setRequired(true)),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.manage_server_required)],
                ephemeral: true
            });
        }

        const id = interaction.options.getString('id');
        const giveaway = giveawayManager.getGiveaway(id);

        if (!giveaway) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_not_found)],
                ephemeral: true
            });
        }

        const result = await giveawayManager.resumeGiveaway(id);

        if (result.success) {
            interaction.reply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.success, lang.resume_success || 'Çekiliş devam ettirildi.')],
                ephemeral: true
            });
        } else {
            const reason = lang[result.reason] || result.reason;
            interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, reason)],
                ephemeral: true
            });
        }
    }
};
