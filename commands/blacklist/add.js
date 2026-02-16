const { SlashCommandSubcommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { readJSON, writeJSON, BLACKLIST_FILE } = require('../../utils/database');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Kullanıcıyı çekiliş kara listesine ekle')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Engellenecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Engel sebebi')),

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

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || lang.no_reason || 'Belirtilmedi';
        const blacklist = readJSON(BLACKLIST_FILE, { users: [], reasons: {} });

        if (blacklist.users.includes(user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.already_blacklisted || 'Bu kullanıcı zaten kara listede.')],
                ephemeral: true
            });
        }

        blacklist.users.push(user.id);
        blacklist.reasons[user.id] = reason;
        writeJSON(BLACKLIST_FILE, blacklist);

        await interaction.reply({
            embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.blacklisted_success_title || 'Kara Listeye Eklendi', `${user} ${lang.blacklisted_success_desc || 'çekiliş kara listesine eklendi.'}\n**${lang.reason}:** ${reason}`)],
            ephemeral: true
        });
    }
};
