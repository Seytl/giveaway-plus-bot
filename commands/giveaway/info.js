const { SlashCommandSubcommandBuilder, EmbedBuilder , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { Colors, Emojis } = require('../../utils/constants');
const { formatFullDate } = require('../../utils/time');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('info')
        .setDescription('Belirli bir çekiliş hakkında detaylı bilgi')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Çekiliş ID')
                .setRequired(true)
                .setAutocomplete(true)),

    async execute(interaction, giveawayManager) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const giveawayId = interaction.options.getString('id');
        const giveaway = giveawayManager.getGiveaway(giveawayId);

        if (!giveaway) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_not_found)],
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${Emojis.INFO} ${lang.info_button}`)
            .setColor(Colors.INFO)
            .addFields([
                { name: `${Emojis.GIFT} ${lang.prize}`, value: giveaway.prize, inline: true },
                { name: `${Emojis.CROWN} ${lang.sponsor}`, value: `<@${giveaway.hostId}>`, inline: true },
                { name: `${Emojis.TROPHY} ${lang.winner_count}`, value: `${giveaway.winnerCount}`, inline: true },
                { name: `${Emojis.USERS} ${lang.participants}`, value: `${giveaway.participants.length}`, inline: true },
                { name: `${Emojis.CHECK} ${lang.status}`, value: giveaway.ended ? lang.giveaway_ended : lang.active, inline: true },
                { name: `${Emojis.CLOCK} ${lang.ends_at}`, value: formatFullDate(new Date(giveaway.endTime)), inline: true }
            ])
            .setFooter({ text: `${lang.giveaway_id}: ${giveaway.id}` })
            .setTimestamp();

        if (giveaway.winners.length > 0) {
            embed.addFields([
                { name: `${Emojis.MEDAL} ${lang.winners}`, value: giveaway.winners.map(w => `<@${w}>`).join(', ') }
            ]);
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
