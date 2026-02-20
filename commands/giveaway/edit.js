const { SlashCommandSubcommandBuilder , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { LanguageManager } = require('../../utils/languageManager');
const { parseDuration } = require('../../utils/time');
const { Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('edit')
        .setDescription('Aktif bir çekilişi düzenle / Edit an active giveaway')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Çekiliş ID / Giveaway ID')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Yeni ödül / New prize')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('winners')
                .setDescription('Yeni kazanan sayısı / New winner count')
                .setRequired(false)
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('add_time')
                .setDescription('Süre ekle veya çıkar (örn: 1h, -30m) / Add or remove time')
                .setRequired(false)),

    async execute(interaction, giveawayManager) {
        const lang = LanguageManager.getLang(interaction.guildId);
        const giveawayId = interaction.options.getString('id');
        const newPrize = interaction.options.getString('prize');
        const newWinnerCount = interaction.options.getInteger('winners');
        const addTimeStr = interaction.options.getString('add_time');

        const giveaway = giveawayManager.getGiveaway(giveawayId);

        if (!giveaway) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_not_found)],
                flags: MessageFlags.Ephemeral
            });
        }

        if (giveaway.ended) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_already_ended || 'Bu çekiliş zaten sona ermiş.')],
                flags: MessageFlags.Ephemeral
            });
        }

        // Calculate time diff
        let addTimeMs = 0;
        if (addTimeStr) {
            // parseDuration usually returns absolute positive ms, we need to handle negative
            const isNegative = addTimeStr.startsWith('-');
            const cleanStr = addTimeStr.replace('-', '');
            const duration = parseDuration(cleanStr);

            if (!duration) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.invalid_duration)],
                    flags: MessageFlags.Ephemeral
                });
            }

            addTimeMs = isNegative ? -duration : duration;
        }

        if (!newPrize && !newWinnerCount && !addTimeMs) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.no_changes || 'Hiçbir değişiklik belirtilmedi.')],
                flags: MessageFlags.Ephemeral
            });
        }

        const result = await giveawayManager.editGiveaway(giveawayId, {
            newPrize,
            newWinnerCount,
            addTime: addTimeMs
        });

        if (result.success) {
            const changes = [];
            if (newPrize) changes.push(`• ${lang.prize}: **${newPrize}**`);
            if (newWinnerCount) changes.push(`• ${lang.winners}: **${newWinnerCount}**`);
            if (addTimeMs) changes.push(`• ${lang.time}: **${addTimeStr}**`);

            await interaction.reply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.success, `${lang.giveaway_edited || 'Çekiliş düzenlendi!'}\n\n${changes.join('\n')}`)],
                flags: MessageFlags.Ephemeral
            });
        } else {
            const reason = lang[result.reason] || result.reason || lang.error;
            await interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, reason)],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
