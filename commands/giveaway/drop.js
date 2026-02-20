const { SlashCommandSubcommandBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('drop')
        .setDescription('Hızlı çekiliş (Drop) başlat')
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Ödül')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kanal'))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('Görsel URL')),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.manage_server_required)],
                flags: MessageFlags.Ephemeral
            });
        }

        const prize = interaction.options.getString('prize');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const image = interaction.options.getString('image');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await giveawayManager.createDrop({
                guildId: interaction.guildId,
                channelId: channel.id,
                hostId: interaction.user.id,
                prize: prize,
                image: image,
                duration: 10 * 60 * 1000 // 10 dakika timeout
            });

            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.success, `${Emojis.CHECK} Drop ${channel} kanalında başlatıldı!`)]
            });
        } catch (error) {
            console.error('[DROP] Hata:', error);
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.command_error)]
            });
        }
    }
};
