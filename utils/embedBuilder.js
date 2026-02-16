const { EmbedBuilder } = require('discord.js');
const { Colors, Emojis } = require('./constants');

/**
 * Creates a standardized, premium-looking embed.
 * @param {Object} options - Embed options
 * @param {string} [options.title] - The title of the embed
 * @param {string} [options.description] - The description of the embed
 * @param {string} [options.color] - The color of the embed (default: Colors.PRIMARY)
 * @param {Object} [options.footer] - Footer object { text, iconURL }
 * @param {string} [options.thumbnail] - Thumbnail URL
 * @param {string} [options.image] - Image URL
 * @param {Array<Object>} [options.fields] - Array of fields { name, value, inline }
 * @param {string} [options.timestamp] - Timestamp (default: true)
 * @param {Object} [options.author] - Author object { name, iconURL, url }
 * @returns {EmbedBuilder}
 */
function createEmbed({
    title,
    description,
    color = Colors.PRIMARY || '#5865F2',
    footer,
    thumbnail,
    image,
    fields,
    timestamp = true,
    author
} = {}) {
    const embed = new EmbedBuilder();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    embed.setColor(color);

    if (footer) {
        embed.setFooter(footer);
    } else {
        embed.setFooter({ text: 'Giveaway+ • The Ultimate Giveaway Bot • Sponsored by Hostimux.com', iconURL: 'https://cdn.discordapp.com/emojis/1155926362534592532.png' });
    }

    if (thumbnail) embed.setThumbnail(thumbnail);
    if (image) embed.setImage(image);
    if (fields) embed.addFields(fields);
    if (timestamp) embed.setTimestamp();
    if (author) embed.setAuthor(author);

    return embed;
}

module.exports = { createEmbed };
