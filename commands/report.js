const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../utils/componentsV2');
const { Colors, Emojis } = require('../utils/constants');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Bir hata veya açık bildir / Report a bug or issue'),

    async execute(interaction) {
        const { LanguageManager } = require('../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Modal oluştur
        const modal = new ModalBuilder()
            .setCustomId('report_modal')
            .setTitle(lang.report_modal_title || '🐛 Bug/Hata Bildir');

        // Başlık input
        const titleInput = new TextInputBuilder()
            .setCustomId('report_title')
            .setLabel(lang.report_title_label || 'Kısa Başlık')
            .setPlaceholder(lang.report_title_placeholder || 'Örn: Çekiliş başlamıyor')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        // Açıklama input
        const descriptionInput = new TextInputBuilder()
            .setCustomId('report_description')
            .setLabel(lang.report_desc_label || 'Detaylı Açıklama')
            .setPlaceholder(lang.report_desc_placeholder || 'Hatayı detaylı açıkla. Ne yaptın? Ne olması gerekiyordu? Ne oldu?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        // Yeniden üretme adımları
        const stepsInput = new TextInputBuilder()
            .setCustomId('report_steps')
            .setLabel(lang.report_steps_label || 'Yeniden Üretme Adımları (Opsiyonel)')
            .setPlaceholder(lang.report_steps_placeholder || '1. /giveaway start yaz\n2. Süre gir\n3. Hata oluşuyor')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500);

        // Rows
        const row1 = new ActionRowBuilder().addComponents(titleInput);
        const row2 = new ActionRowBuilder().addComponents(descriptionInput);
        const row3 = new ActionRowBuilder().addComponents(stepsInput);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);
    },

    // Modal submit handler (index.js'de çağrılacak)
    async handleModalSubmit(interaction) {
        const { LanguageManager } = require('../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const title = interaction.fields.getTextInputValue('report_title');
        const description = interaction.fields.getTextInputValue('report_description');
        const steps = interaction.fields.getTextInputValue('report_steps') || lang.not_provided || 'Belirtilmedi';

        // Webhook kontrolü
        if (!config.webhooks || !config.webhooks.enabled || !config.webhooks.reportUrl || config.webhooks.reportUrl === 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.report_disabled || 'Hata bildirme sistemi şu anda devre dışı.')],
                ephemeral: true
            });
        }

        try {
            // Webhook'a gönder
            const webhookEmbed = {
                embeds: [{
                    title: `🐛 Yeni Hata Bildirimi`,
                    color: 0xFF6B6B,
                    fields: [
                        {
                            name: '📝 Başlık',
                            value: title,
                            inline: false
                        },
                        {
                            name: '📋 Açıklama',
                            value: description,
                            inline: false
                        },
                        {
                            name: '🔄 Yeniden Üretme Adımları',
                            value: steps,
                            inline: false
                        },
                        {
                            name: '👤 Bildiren',
                            value: `${interaction.user.tag} (\`${interaction.user.id}\`)`,
                            inline: true
                        },
                        {
                            name: '🏠 Sunucu',
                            value: `${interaction.guild?.name || 'DM'} (\`${interaction.guildId || 'N/A'}\`)`,
                            inline: true
                        }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Report ID: ${Date.now().toString(36).toUpperCase()}`
                    }
                }]
            };

            const response = await fetch(config.webhooks.reportUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(webhookEmbed)
            });

            if (!response.ok) {
                throw new Error(`Webhook error: ${response.status}`);
            }

            // Başarı mesajı
            const successEmbed = GiveawayComponentsV2.createSuccessEmbed(
                lang.report_sent_title || '✅ Rapor Gönderildi!',
                lang.report_sent_desc || 'Hata bildiriminiz başarıyla iletildi. Geliştirici en kısa sürede inceleyecektir. Teşekkürler!'
            );

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('[REPORT] Webhook gönderme hatası:', error);
            await interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.report_error || 'Rapor gönderilirken bir hata oluştu.')],
                ephemeral: true
            });
        }
    }
};
