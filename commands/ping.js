const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../utils/embedBuilder');
const { Colors, Emojis } = require('../utils/constants');
const { LanguageManager } = require('../utils/languageManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Bot gecikme süresini kontrol et / Check bot latency')
        .setDMPermission(true),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);
        const sent = await interaction.reply({ content: lang.ping_calculating || 'Calculating...', fetchReply: true });

        const ping = interaction.client.ws.ping;
        const latency = sent.createdTimestamp - interaction.createdTimestamp;

        const embed = createEmbed({
            title: `${Emojis.ROCKET || '🚀'} ${lang.pong || 'Pong!'}`,
            color: ping < 100 ? Colors.SUCCESS : ping < 200 ? Colors.WARNING : Colors.ERROR,
            fields: [
                { name: `${Emojis.CLOCK || '⏰'} ${lang.api_latency || 'API Latency'}`, value: `\`${ping}ms\``, inline: true },
                { name: `${Emojis.ARROW || '➡️'} ${lang.message_latency || 'Message Latency'}`, value: `\`${latency}ms\``, inline: true },
                { name: `${Emojis.CALENDAR || '📅'} ${lang.uptime || 'Uptime'}`, value: `\`${Math.floor(interaction.client.uptime / 1000 / 60)} ${lang.minutes || 'min'}\``, inline: true }
            ]
        });

        return interaction.editReply({ content: null, embeds: [embed] });
    }
};
