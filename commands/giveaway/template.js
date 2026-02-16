const { SlashCommandSubcommandGroupBuilder, EmbedBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { TemplateManager } = require('../../utils/templateManager');
const { Colors, Emojis } = require('../../utils/constants');
const { parseDuration, formatDuration } = require('../../utils/time');
const { LanguageManager } = require('../../utils/languageManager');

module.exports = {
    data: new SlashCommandSubcommandGroupBuilder()
        .setName('template')
        .setDescription('Çekiliş şablonlarını yönet / Manage giveaway templates')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Yeni şablon oluştur / Create new template')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Şablon adı / Template name')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('prize')
                        .setDescription('Ödül / Prize')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('Süre (örn: 1d 2h) / Duration')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('winners')
                        .setDescription('Kazanan sayısı / Winner count')
                        .setMinValue(1)
                        .setMaxValue(50)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Şablonla çekiliş başlat / Start giveaway with template')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Şablon adı / Template name')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Şablonları listele / List templates'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Şablon sil / Delete template')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Şablon adı / Template name')
                        .setRequired(true)
                        .setAutocomplete(true))),

    async execute(interaction, giveawayManager) {
        const lang = LanguageManager.getLang(interaction.guildId);
        const subcommand = interaction.options.getSubcommand();

        // Şablon Oluştur
        if (subcommand === 'create') {
            const name = interaction.options.getString('name');
            const prize = interaction.options.getString('prize');
            const duration = interaction.options.getString('duration');
            const winners = interaction.options.getInteger('winners') || 1;

            // Süre kontrolü
            const durationMs = parseDuration(duration);
            if (!durationMs) {
                return interaction.reply({
                    content: `${Emojis.CROSS} ${lang.invalid_duration} ${lang.min_duration_error}`,
                    ephemeral: true
                });
            }

            const result = TemplateManager.createTemplate(interaction.guildId, name, {
                prize,
                duration: durationMs,
                winnerCount: winners,
                channelId: interaction.channelId,
                hostedBy: interaction.user.id
            });

            if (result.success) {
                const embed = GiveawayComponentsV2.createSuccessEmbed(
                    lang.template_created || 'Şablon Oluşturuldu',
                    `${Emojis.CHECK} **${name}**\n\n${Emojis.GIFT} ${lang.prize}: ${prize}\n${Emojis.CLOCK} ${lang.duration}: ${duration}\n${Emojis.TROPHY} ${lang.winner_count}: ${winners}`
                );

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, `${result.reason}`)],
                    ephemeral: true
                });
            }
        }

        // Şablonla Başlat
        else if (subcommand === 'start') {
            const name = interaction.options.getString('name');
            const template = TemplateManager.getTemplate(interaction.guildId, name);

            if (!template) {
                return interaction.reply({
                    content: `${Emojis.CROSS} ${lang.template_not_found || 'Şablon bulunamadı.'}`,
                    ephemeral: true
                });
            }

            // Çekilişi başlat
            try {
                const giveaway = await giveawayManager.create({
                    guildId: interaction.guildId,
                    channelId: interaction.channelId,
                    hostId: interaction.user.id,
                    prize: template.prize,
                    winnerCount: template.winnerCount,
                    duration: template.duration,
                    requirements: {}, // Template'de requirements varsa eklenebilir
                    bonusEntries: [] // Template'de varsa eklenebilir
                });

                await interaction.reply({
                    content: `${Emojis.CHECK} **${name}** ${lang.template_started || 'şablonu kullanılarak çekiliş başlatıldı!'}`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('[TEMPLATE START] Error:', error);
                await interaction.reply({
                    content: `${Emojis.ERROR} ${lang.start_error || 'Çekiliş başlatılırken hata oluştu.'}`,
                    ephemeral: true
                });
            }
        }

        // Listele
        else if (subcommand === 'list') {
            const templates = TemplateManager.getTemplates(interaction.guildId);

            if (templates.length === 0) {
                return interaction.reply({
                    content: lang.no_templates || 'Hiç kayıtlı şablonunuz yok.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`${Emojis.GIVEAWAY} ${lang.templates || 'Çekiliş Şablonları'}`)
                .setColor(Colors.PRIMARY)
                .setDescription(templates.map((t, i) =>
                    `**${i + 1}. ${t.name}**\n${Emojis.GIFT} ${t.prize} | ${t.winnerCount} ${lang.winners || 'Kazanan'} | ${Math.floor(t.duration / 60000)}dk`
                ).join('\n\n'))
                .setFooter({ text: `${lang.total}: ${templates.length}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Sil
        else if (subcommand === 'delete') {
            const name = interaction.options.getString('name');
            const result = TemplateManager.deleteTemplate(interaction.guildId, name);

            if (result.success) {
                await interaction.reply({
                    content: `${Emojis.CHECK} **${name}** ${lang.template_deleted || 'şablonu silindi.'}`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `${Emojis.CROSS} ${lang.template_not_found || 'Şablon bulunamadı veya silinemedi.'}`,
                    ephemeral: true
                });
            }
        }
    }
};
