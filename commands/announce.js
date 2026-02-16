const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GiveawayComponentsV2 } = require('../utils/componentsV2');
const { Colors } = require('../utils/constants');
const config = require('../config.json'); // Assuming config has ownerId

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Sends an update announcement to a specific channel (Owner Only).')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the announcement to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the announcement')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Content of the announcement (supports newlines)')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Banner image for the announcement'))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to mention (e.g., @everyone)'))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Hex color for the embed (default: Primary)')),
    async execute(interaction) {
        // Owner Check
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed('Permission Error', 'Only the bot owner can use this command.')],
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        // Replace literal \n with actual newlines if user typed them
        const description = interaction.options.getString('description').replace(/\\n/g, '\n');
        const image = interaction.options.getAttachment('image');
        const role = interaction.options.getRole('role');
        const colorInput = interaction.options.getString('color');

        // Validate Channel Permissions
        if (!channel.isTextBased()) {
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed('Invalid Channel', 'Please select a text-based channel.')],
                ephemeral: true
            });
        }

        let color = Colors.PRIMARY;
        if (colorInput) {
            // Basic hex validation/parsing could go here, for now trust the input or fallback
            if (/^#[0-9A-F]{6}$/i.test(colorInput)) {
                color = colorInput;
            }
        }

        const embed = GiveawayComponentsV2.createAnnouncementEmbed(
            title,
            description,
            image ? image.url : null,
            color
        );

        let content = '';
        if (role) {
            content = `<@&${role.id}>`;
        }

        try {
            await channel.send({ content: content || null, embeds: [embed] });

            return interaction.reply({
                embeds: [GiveawayComponentsV2.createSuccessEmbed('Announcement Sent', `Successfully sent announcement to ${channel}.`)],
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            return interaction.reply({
                embeds: [GiveawayComponentsV2.createErrorEmbed('Error', 'Failed to send announcement. Check bot permissions in that channel.')],
                ephemeral: true
            });
        }
    },
};
