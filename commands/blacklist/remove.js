const { SlashCommandSubcommandBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { readJSON, writeJSON, BLACKLIST_FILE } = require('../../utils/database');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Kullanıcıyı çekiliş kara listesinden çıkar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Çıkarılacak kullanıcı')
                .setRequired(true)),

    async execute(interaction) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        const config = require('../../config.json');

        // Yetki kontrolü (Sadece Bot Sahibi)
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.only_owner)],
                flags: MessageFlags.Ephemeral
            });
        }

        const user = interaction.options.getUser('user');
        const blacklist = readJSON(BLACKLIST_FILE, { users: [], reasons: {} });
        const index = blacklist.users.indexOf(user.id);

        if (index === -1) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.not_blacklisted || 'Bu kullanıcı kara listede değil.')],
                flags: MessageFlags.Ephemeral
            });
        }

        blacklist.users.splice(index, 1);
        delete blacklist.reasons[user.id];
        writeJSON(BLACKLIST_FILE, blacklist);

        await interaction.reply({
            embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.unblacklisted_success_title || 'Kara Listeden Çıkarıldı', `${user} ${lang.unblacklisted_success_desc || 'çekiliş kara listesinden çıkarıldı.'}`)],
            flags: MessageFlags.Ephemeral
        });
    }
};
