const { SlashCommandSubcommandBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('end')
        .setDescription('Bir çekilişi erken sonlandır')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Çekiliş ID (örn: GW-XXXXX-XXXX)')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Yetki kontrolü
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.manage_server_required)],
                flags: MessageFlags.Ephemeral
            });
        }

        const giveawayId = interaction.options.getString('id');
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const giveaway = await giveawayManager.endGiveaway(giveawayId);

        if (giveaway) {
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.giveaway_ended_title, `\`${giveawayId}\``)]
            });
        } else {
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_or_ended)]
            });
        }
    }
};
