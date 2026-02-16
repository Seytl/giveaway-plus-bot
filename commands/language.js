const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const { LanguageManager } = require('../utils/languageManager');
const { Colors, Emojis } = require('../utils/constants');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Sunucu dilini değiştir / Change server language')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);
        const availableLanguages = LanguageManager.getAvailableLanguages();
        const currentLang = LanguageManager.getServerLanguage(interaction.guildId);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('language_select')
            .setPlaceholder(lang.select_language)
            .addOptions(
                availableLanguages.map(l => ({
                    label: l.name,
                    value: l.code,
                    emoji: '🌐',
                    default: l.code === currentLang
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle(`${Emojis.INFO} ${lang.language}`)
            .setColor(Colors.PRIMARY)
            .setDescription(`**${lang.select_language}**`)
            .setFooter({ text: `Current / Mevcut: ${lang.language_name}` })
            .setTimestamp();

        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

        // Seçim bekle
        try {
            const collector = response.createMessageComponentCollector({
                time: 60000
            });

            collector.on('collect', async (i) => {
                if (i.customId === 'language_select') {
                    const selectedLang = i.values[0];
                    LanguageManager.setServerLanguage(interaction.guildId, selectedLang);

                    const newLang = LanguageManager.getLang(interaction.guildId);

                    const successEmbed = new EmbedBuilder()
                        .setTitle(`${Emojis.CHECK} ${newLang.language_changed}`)
                        .setColor(Colors.SUCCESS)
                        .setDescription(`${newLang.language_set}: **${newLang.language_name}**`)
                        .setTimestamp();

                    await i.update({
                        embeds: [successEmbed],
                        components: []
                    });

                    collector.stop();
                }
            });
        } catch (error) {
            console.error('[LANGUAGE] Error:', error);
        }
    }
};
