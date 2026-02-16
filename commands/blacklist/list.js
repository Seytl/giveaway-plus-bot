const { SlashCommandSubcommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { readJSON, BLACKLIST_FILE } = require('../../utils/database');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Çekiliş kara listesini görüntüle'),

    async execute(interaction) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const config = require('../../config.json');

        // Yetki kontrolü (Sadece Bot Sahibi)
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.only_owner)],
                ephemeral: true
            });
        }

        const blacklist = readJSON(BLACKLIST_FILE, { users: [], reasons: {} });

        // Convert to format expected by createBlacklistEmbed
        const formattedList = blacklist.users.map(id => ({
            userId: id,
            reason: blacklist.reasons[id]
        }));

        const embed = GiveawayComponentsV2.createBlacklistEmbed(formattedList, 1, 1, lang);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
