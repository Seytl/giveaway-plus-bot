const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , MessageFlags } = require('discord.js');
const { createEmbed } = require('../utils/embedBuilder');
const { LanguageManager } = require('../utils/languageManager');
const { Colors, Emojis } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('privacy')
        .setDescription('View our Privacy Policy / Gizlilik Politikamızı görüntüleyin'),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);
        const date = new Date().toLocaleDateString('tr-TR'); // Or dynamic based on lang

        const embed = createEmbed({
            title: `${Emojis.SHIELD} ${lang.privacy_policy_title || 'Privacy Policy'}`,
            description: lang.privacy_text || 'Privacy policy is currently unavailable.',
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
