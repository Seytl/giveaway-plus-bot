const { SlashCommandSubcommandBuilder , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager } = require('../../utils/database');
const config = require('../../config.json');
const { Emojis } = require('../../utils/constants');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Tüm premium sunucu ve kullanıcıları listele (Sadece bot sahibi)'),

    async execute(interaction) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Sadece bot sahibi kullanabilir
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.owner_only)],
                flags: MessageFlags.Ephemeral
            });
        }

        const premiumServers = PremiumManager.listPremiumServers();
        const premiumUsers = PremiumManager.listPremiumUsers();

        // Prepare data for servers
        const activeServers = premiumServers.filter(s => s.isActive);
        const serverListWithNames = [];
        for (const server of activeServers.slice(0, 10)) {
            let name = lang.unknown;
            try {
                const guild = await interaction.client.guilds.fetch(server.id).catch(() => null);
                if (guild) name = guild.name;
            } catch { }

            serverListWithNames.push({
                id: server.id,
                name: name,
                expiresAt: server.expires,
                permanent: server.expires === 'lifetime',
                type: 'server'
            });
        }

        // Prepare data for users
        const activeUsers = premiumUsers.filter(u => u.isActive);
        const userListWithNames = [];
        for (const user of activeUsers.slice(0, 10)) {
            let name = lang.unknown;
            try {
                const fetchedUser = await interaction.client.users.fetch(user.id).catch(() => null);
                if (fetchedUser) name = fetchedUser.tag;
            } catch { }

            userListWithNames.push({
                id: user.id,
                name: name,
                expiresAt: user.expires,
                permanent: user.expires === 'lifetime',
                type: 'user'
            });
        }

        // Combine lists or display separately? V2 createPremiumListEmbed handles one list.
        // We might need to call it twice or create a combined custom embed using V2 style components if possible.
        // But the user wants usage of V2 components.
        // createPremiumListEmbed currently assumes a single list.
        // Let's create a combined list for now, or just send two embeds? Two embeds might be too much.
        // Let's modify the command to send one embed with fields, but utilizing createListEmbed style manually if needed.
        // OR, just use createPremiumListEmbed for both arrays concatenated, distinguished by type in the list logic I added (name/type).

        const combinedList = [...serverListWithNames, ...userListWithNames];
        const embed = GiveawayComponentsV2.createPremiumListEmbed(combinedList, 1, 1, lang);

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
