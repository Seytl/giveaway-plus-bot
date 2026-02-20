const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags } = require('discord.js');
const { createEmbed } = require('../utils/embedBuilder');
const { LanguageManager } = require('../utils/languageManager');
const { Colors, Emojis } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tos')
        .setDescription('View our Terms of Service / Hizmet Şartlarımızı görüntüleyin'),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);

        const embed = createEmbed({
            title: `${Emojis.DOCS} ${lang.tos_title || 'Terms of Service'}`,
            description: lang.tos_text || 'Terms of Service are currently unavailable.',
            color: Colors.PRIMARY,
            footer: { text: (lang.policy_last_updated || 'Last Updated: {date}').replace('{date}', '24.01.2026') }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(lang.support_server_button || 'Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/qaNsZcBw8d')
            );

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    }
};
