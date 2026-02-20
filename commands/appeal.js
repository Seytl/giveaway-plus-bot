const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../utils/componentsV2');
const { Colors, Emojis } = require('../utils/constants');
const config = require('../config.json');
const { readJSON, BLACKLIST_FILE } = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('appeal')
        .setDescription('Appeal a blacklist decision'),

    async execute(interaction) {
        const { LanguageManager } = require('../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Check if user is actually blacklisted (Optional, but good context)
        const blacklist = readJSON(BLACKLIST_FILE, { users: [], reasons: {} });
        const isBlacklisted = blacklist.users.includes(interaction.user.id);

        // Modal oluştur
        const modal = new ModalBuilder()
            .setCustomId('appeal_modal')
            .setTitle(lang.appeal_modal_title || '⚖️ Appeal Decision');

        // Konu input
        const subjectInput = new TextInputBuilder()
            .setCustomId('appeal_subject')
            .setLabel(lang.appeal_subject_label || 'Subject')
            .setPlaceholder(lang.appeal_subject_placeholder || 'User Ban / Server Ban')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);

        // Savunma input
        const defenseInput = new TextInputBuilder()
            .setCustomId('appeal_defense')
            .setLabel(lang.appeal_defense_label || 'Defense')
            .setPlaceholder(lang.appeal_defense_placeholder || 'Why should the ban be lifted?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        // Rows
        const row1 = new ActionRowBuilder().addComponents(subjectInput);
        const row2 = new ActionRowBuilder().addComponents(defenseInput);

        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    },

    // Modal submit handler (index.js'de çağrılacak)
    async handleModalSubmit(interaction) {
        const { LanguageManager } = require('../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);
        const { readJSON, BLACKLIST_FILE } = require('../utils/database');

        const subject = interaction.fields.getTextInputValue('appeal_subject');
        const defense = interaction.fields.getTextInputValue('appeal_defense');

        // Webhook kontrolü (Dedicated Appeal Webhook)
        if (!config.webhooks || !config.webhooks.enabled || !config.webhooks.appealUrl || config.webhooks.appealUrl === 'YOUR_APPEAL_WEBHOOK_URL_HERE') {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error || 'Error', lang.appeal_disabled || 'Appeal system is currently disabled or not configured.')],
                flags: MessageFlags.Ephemeral
            });
        }

        // Check blacklist status for context
        const blacklist = readJSON(BLACKLIST_FILE, { users: [], reasons: {} });
        const isBlacklisted = blacklist.users.includes(interaction.user.id);
        const banReason = isBlacklisted ? (blacklist.reasons[interaction.user.id] || 'N/A') : 'Not found in list';

        try {
            // Webhook'a gönder
            const webhookEmbed = {
                embeds: [{
                    title: `⚖️ New Appeal (İtiraz)`,
                    color: 0xFEE75C, // WARNING Color
                    fields: [
                        {
                            name: '📝 Subject',
                            value: subject,
                            inline: true
                        },
                        {
                            name: '🚫 Status',
                            value: isBlacklisted ? `**BLACKLISTED**\nReason: ${banReason}` : 'Not Blacklisted (User)',
                            inline: true
                        },
                        {
                            name: '🛡️ Defense',
                            value: defense,
                            inline: false
                        },
                        {
                            name: '👤 User',
                            value: `${interaction.user.tag} (\`${interaction.user.id}\`)`,
                            inline: true
                        },
                        {
                            name: '🏠 Guild',
                            value: `${interaction.guild?.name || 'DM'} (\`${interaction.guildId || 'N/A'}\`)`,
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Appeal ID: ${Date.now().toString(36).toUpperCase()}`
                    }
                }]
            };

            const response = await fetch(config.webhooks.appealUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookEmbed)
            });

            if (!response.ok) {
                throw new Error(`Webhook error: ${response.status}`);
            }

            // Başarı mesajı
            const successEmbed = GiveawayComponentsV2.createSuccessEmbed(
                lang.appeal_sent_title || 'Appeal Sent',
                lang.appeal_sent_desc || 'Your appeal has been sent to the support team. It will be reviewed shortly.'
            );

            await interaction.reply({
                embeds: [successEmbed],
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            console.error('[APPEAL] Webhook error:', error);
            await interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error || 'Error', lang.report_error || 'An error occurred while sending the report.')],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
