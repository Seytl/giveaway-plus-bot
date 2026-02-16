const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createEmbed } = require('../utils/embedBuilder');
const { Colors, Emojis } = require('../utils/constants');
const { LanguageManager } = require('../utils/languageManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Bot komutları hakkında yardım al / Get help about bot commands')
        .setDMPermission(true),

    async execute(interaction) {
        const lang = LanguageManager.getLang(interaction.guildId);

        const helpEmbed = createEmbed({
            title: `${Emojis.INFO || 'ℹ️'} ${lang.help_title || 'Help Menu'}`,
            description: `${lang.mention_response.replace('{user}', interaction.user).replace('{bot}', interaction.client.user.username)}\n\n${lang.help_description || 'Here are the available commands:'}`,
            color: Colors.PRIMARY,
            thumbnail: interaction.client.user.displayAvatarURL(),
            header: { text: 'Giveaway+' }, // Custom header if supported by util (it's not but we can just use title)
            fields: [
                {
                    name: `${Emojis.GIFT || '🎁'} ${lang.giveaway_commands || 'Giveaway Commands'}`,
                    value: `> \`/giveaway start\` - ${lang.giveaway_started_title || 'Start a giveaway'}\n> \`/giveaway end\` - ${lang.giveaway_ended_title || 'End a giveaway'}\n> \`/giveaway list\` - ${lang.active_giveaways || 'List active giveaways'}\n> \`/giveaway reroll\` - ${lang.reroll_button || 'Reroll a winner'}`,
                    inline: false
                },
                {
                    name: `${Emojis.SHIELD || '🛡️'} ${lang.blacklist_commands || 'Security & Policies'}`,
                    value: `> \`/privacy\` - ${lang.privacy_button || 'Privacy Policy'}\n> \`/tos\` - ${lang.tos_button || 'Terms of Service'}\n> \`/gblacklist add/remove\` - ${lang.blacklist_title || 'Manage blacklist'}`,
                    inline: false
                },
                {
                    name: `${Emojis.DIAMOND || '💎'} ${lang.premium_commands || 'Premium Commands'}`,
                    value: `> \`/premium info\` - ${lang.premium_features_title || 'Premium Features'}\n> \`/premium status\` - ${lang.premium_status || 'Check Status'}`,
                    inline: false
                },
                {
                    name: `${Emojis.GEAR || '⚙️'} ${lang.other_commands || 'Other Commands'}`,
                    value: `> \`/invite\` - ${lang.invite_bot || 'Invite bot'}\n> \`/ping\` - ${lang.pong || 'Check latency'}\n> \`/botinfo\` - ${lang.bot_info || 'Bot stats'}`,
                    inline: false
                }
            ],
            footer: { text: `Giveaway+ • Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() }
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
                    .setURL('https://discord.gg/qaNsZcBw8d'),
                new ButtonBuilder()
                    .setLabel(lang.vote_button || 'Vote')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://top.gg/bot/your-bot-id')
            );

        return interaction.reply({ embeds: [helpEmbed], components: [row], ephemeral: true });
    }
};
