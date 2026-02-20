const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags } = require('discord.js');
const { createEmbed } = require('../utils/embedBuilder');
const { Colors, Emojis } = require('../utils/constants');
const { LanguageManager } = require('../utils/languageManager');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Botu sunucuna davet et / Invite bot to your server')
        .setDMPermission(true),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);
        // Permissions: 274878024768 (as per previous logic)
        const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=274878024768&scope=bot%20applications.commands`;

        const embed = createEmbed({
            title: `${Emojis.GIFT || '🎁'} ${lang.invite_bot || 'Invite Anarvion'}`,
            color: Colors.PRIMARY,
            description: `${Emojis.SPARKLES || '✨'} ${lang.invite_desc || 'Click the link below to invite the bot to your server!'} (Or click the button below)\n\n${Emojis.INFO || 'ℹ️'} **${lang.required_permissions || 'Required Permissions'}:**\n• ${lang.messages || 'Send Messages'}\n• ${lang.embeds || 'Embed Links'}\n• ${lang.read_history || 'Read Message History'}\n• ${lang.add_reactions || 'Add Reactions'}`,
            footer: { text: 'Giveaway+ • The Best Choice' }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(lang.invite_bot || 'Invite Now')
                    .setStyle(ButtonStyle.Link)
                    .setURL(inviteUrl),
                new ButtonBuilder()
                    .setLabel(lang.support_server_button || 'Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/qaNsZcBw8d')
            );

        return interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    }
};
