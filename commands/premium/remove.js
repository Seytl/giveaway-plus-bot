const { SlashCommandSubcommandBuilder, EmbedBuilder } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager } = require('../../utils/database');
const { Colors, Emojis } = require('../../utils/constants');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Sunucu veya kullanıcıdan premium kaldır (Sadece bot sahibi)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Premium türü')
                .setRequired(true)
                .addChoices(
                    { name: 'Sunucu', value: 'server' },
                    { name: 'Kullanıcı', value: 'user' }
                ))
        .addStringOption(option =>
            option.setName('target_id')
                .setDescription('Sunucu veya kullanıcı ID')
                .setRequired(true)),

    async execute(interaction) {
        const { LanguageManager } = require('../../utils/languageManager');
        const lang = LanguageManager.getLang(interaction.guildId);

        // Sadece bot sahibi kullanabilir
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.owner_only)],
                ephemeral: true
            });
        }

        const type = interaction.options.getString('type');
        const targetId = interaction.options.getString('target_id');

        let success;
        let targetName;

        if (type === 'server') {
            success = PremiumManager.removeServerPremium(targetId);
            try {
                const guild = await interaction.client.guilds.fetch(targetId);
                targetName = guild.name;
            } catch {
                targetName = targetId;
            }
        } else {
            success = PremiumManager.removeUserPremium(targetId);
            try {
                const user = await interaction.client.users.fetch(targetId);
                targetName = user.tag;
            } catch {
                targetName = targetId;
            }
        }

        if (success) {
            const embed = new EmbedBuilder()
                .setTitle(`${Emojis.CHECK} ${lang.premium_removed}`)
                .setColor(Colors.SUCCESS)
                .setDescription(`${Emojis.ARROW} **${lang.type}:** ${type === 'server' ? lang.server : lang.user}
${Emojis.ARROW} **${lang.target}:** ${targetName}
${Emojis.ARROW} **ID:** \`${targetId}\``)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({
                embeds: [GiveawayEmbeds.createErrorEmbed(lang.error, lang.premium_not_found)],
                ephemeral: true
            });
        }
    }
};
