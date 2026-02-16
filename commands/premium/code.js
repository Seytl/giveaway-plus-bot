const { SlashCommandSubcommandBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager } = require('../../utils/database');
const { GiveawayManager } = require('../../utils/GiveawayManager');
const { LanguageManager } = require('../../utils/languageManager');
const { Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('code')
        .setDescription('Kod teslimli çekiliş başlat (Premium) / Start code giveaway')
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Ödül / Prize')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Süre (örn: 10m, 1h) / Duration')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('Kod dosyası (.txt) / Code file')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('codes')
                .setDescription('Manuel kodlar (virgülle ayır) / Manual codes')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Kazanan sayısı (otomatik: kod sayısı) / Winner count')
                .setRequired(false)),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);

        // Premium Kontrolü
        if (!PremiumManager.isServerPremium(interaction.guildId)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.premium_required, lang.premium_feature_desc)],
                ephemeral: true
            });
        }

        const prize = interaction.options.getString('prize');
        const durationStr = interaction.options.getString('duration');
        const file = interaction.options.getAttachment('file');
        const manualCodes = interaction.options.getString('codes');
        let winnerCount = interaction.options.getInteger('winners');

        let codes = [];

        await interaction.deferReply({ ephemeral: true });

        // 1. Dosyadan Kod Okuma
        if (file) {
            if (!file.name.endsWith('.txt')) {
                return interaction.editReply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.invalid_file_type || 'Sadece .txt dosyaları desteklenir.')]
                });
            }

            try {
                const response = await fetch(file.url);
                if (!response.ok) throw new Error('Dosya indirilemedi');
                const text = await response.text();
                // Satır satır böl ve temizle
                const fileCodes = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
                codes.push(...fileCodes);
            } catch (error) {
                console.error('[CODE GIVEAWAY] File error:', error);
                return interaction.editReply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.file_read_error || 'Dosya okunurken hata oluştu.')]
                });
            }
        }

        // 2. Manuel Kod Okuma
        if (manualCodes) {
            const manualList = manualCodes.split(',').map(c => c.trim()).filter(c => c.length > 0);
            codes.push(...manualList);
        }

        // Kod var mı?
        if (codes.length === 0) {
            return interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.no_codes_found || 'Hiçbir kod bulunamadı. Lütfen dosya yükleyin veya kod girin.')]
            });
        }

        // Kazanan Sayısı Belirleme
        if (!winnerCount) {
            winnerCount = codes.length;
        } else if (winnerCount > codes.length) {
            winnerCount = codes.length; // Kod sayısından fazla kazanan olamaz
        }

        // Süre Ayrıştırma
        const { parseDuration } = require('../../utils/time');
        const duration = parseDuration(durationStr);

        if (!duration) {
            return interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.invalid_duration)]
            });
        }

        // Çekilişi Başlat
        try {
            const manager = new GiveawayManager(interaction.client);
            await manager.create({
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                hostId: interaction.user.id,
                prize: prize,
                duration: duration,
                winnerCount: winnerCount,
                codes: codes // Kodları yöneticiye pasla
            });

            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(
                    lang.success,
                    `${lang.giveaway_started_title}\n\n${Emojis.GIFT} **${lang.prize}:** ${prize}\n${Emojis.doc || '📄'} **${lang.codes}:** ${codes.length}\n${Emojis.TROPHY} **${lang.winners}:** ${winnerCount}`
                )]
            });

        } catch (error) {
            console.error('[PREMIUM CODE] Start error:', error);
            await interaction.editReply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.command_error)]
            });
        }
    }
};
