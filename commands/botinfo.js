const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../utils/embedBuilder');
const { Colors, Emojis } = require('../utils/constants');
const { LanguageManager } = require('../utils/languageManager');
const { GiveawayManager } = require('../utils/GiveawayManager');
const { PremiumManager } = require('../utils/database'); // Check if this path is correct relative to commands/
const os = require('os');
const { version: djsVersion } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Bot hakkında detaylı bilgi / Detailed bot info')
        .setDMPermission(true),

    async execute(interaction, giveawayManager) {
        // Fix for GM if not passed (though index.js should pass it)
        const gm = giveawayManager || new GiveawayManager(interaction.client);

        const lang = LanguageManager.getLang(interaction.guildId);
        const uptime = interaction.client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor((uptime % 86400000) / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);

        const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMembers = interaction.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const activeGiveaways = gm.getActiveGiveaways ? gm.getActiveGiveaways().length : 0;

        const embed = createEmbed({
            title: `${Emojis.ROCKET || '🚀'} ${lang.bot_info || 'Bot Information'}`,
            color: Colors.PREMIUM,
            thumbnail: interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }),
            description: `${Emojis.SPARKLES || '✨'} **${lang.bot_name || 'Anarvion Giveaway'}**\n${lang.bot_slogan || 'The most advanced, fast, and reliable giveaway bot.'}`,
            fields: [
                {
                    name: `${Emojis.INFO || 'ℹ️'} ${lang.general || 'General'}`,
                    value: `> ${Emojis.ARROW || '➡️'} **${lang.server_count || 'Servers'}:** \`${interaction.client.guilds.cache.size}\`\n> ${Emojis.USERS || '👥'} **${lang.user_count || 'Users'}:** \`${totalMembers}\`\n> ${Emojis.GIVEAWAY || '🎉'} **${lang.active_giveaway_count || 'Active Giveaways'}:** \`${activeGiveaways}\``,
                    inline: false
                },
                {
                    name: `${Emojis.GEAR || '⚙️'} ${lang.system || 'System'}`,
                    value: `> ${Emojis.CLOCK || '⏰'} **${lang.uptime || 'Uptime'}:** \`${days}d ${hours}h ${minutes}m\`\n> ${Emojis.ARROW || '➡️'} **${lang.ram_usage || 'RAM Use'}:** \`${ramUsage} MB\`\n> ${Emojis.ARROW || '➡️'} **${lang.os || 'OS'}:** \`${os.type()} ${os.release()}\``,
                    inline: true
                },
                {
                    name: `${Emojis.CROWN || '👑'} ${lang.versions || 'Versions'}`,
                    value: `> ${Emojis.DIAMOND || '💎'} **Bot:** \`v${require('../package.json').version}\`\n> ${Emojis.DIAMOND || '💎'} **D.js:** \`v${djsVersion}\`\n> ${Emojis.DIAMOND || '💎'} **Node:** \`${process.version}\``,
                    inline: true
                },
                // Only show premium status if in a guild
                ...(interaction.guild ? [{
                    name: `${Emojis.DIAMOND || '💎'} Premium Status`,
                    value: PremiumManager.isServerPremium(interaction.guildId)
                        ? `> ${Emojis.CHECK || '✅'} **${lang.active || 'Active'}**`
                        : `> ${Emojis.CROSS || '❌'} **${lang.not_active || 'Not Active'}**`,
                    inline: false
                }] : [])
            ],
            footer: { text: `${lang.most_advanced_bot || 'Advanced Giveaway Bot'} | ${lang.developer || 'Dev'}: Anarvion`, iconURL: interaction.user.displayAvatarURL() }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(lang.invite_bot || 'Invite')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`),
                new ButtonBuilder()
                    .setLabel(lang.support_server_button || 'Support')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/your-support-server')
            );

        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
