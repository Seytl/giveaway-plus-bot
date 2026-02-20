const { SlashCommandSubcommandBuilder, PermissionFlagsBits, EmbedBuilder , MessageFlags } = require('discord.js');
const { GiveawayComponentsV2 } = require('../../utils/componentsV2');
const { PremiumManager } = require('../../utils/database');
const { Colors, Emojis } = require('../../utils/constants');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Sunucu veya kullanıcıya premium ekle (Sadece bot sahibi)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Premium türü')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Server',
                        value: 'server',
                        nameLocalizations: {
                            'tr': 'Sunucu',
                            'de': 'Server',
                            'fr': 'Serveur',
                            'es-ES': 'Servidor',
                            'ru': 'Сервер'
                        }
                    },
                    {
                        name: 'User',
                        value: 'user',
                        nameLocalizations: {
                            'tr': 'Kullanıcı',
                            'de': 'Benutzer',
                            'fr': 'Utilisateur',
                            'es-ES': 'Usuario',
                            'ru': 'Пользователь'
                        }
                    }
                ))
        .addStringOption(option =>
            option.setName('target_id')
                .setDescription('Sunucu veya kullanıcı ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Premium süresi')
                .setRequired(true)
                .addChoices(
                    {
                        name: '1 Week',
                        value: '7d',
                        nameLocalizations: {
                            'tr': '1 Hafta',
                            'de': '1 Woche',
                            'fr': '1 Semaine',
                            'es-ES': '1 Semana',
                            'ru': '1 Неделя'
                        }
                    },
                    {
                        name: '1 Month',
                        value: '30d',
                        nameLocalizations: {
                            'tr': '1 Ay',
                            'de': '1 Monat',
                            'fr': '1 Mois',
                            'es-ES': '1 Mes',
                            'ru': '1 Месяц'
                        }
                    },
                    {
                        name: '3 Months',
                        value: '90d',
                        nameLocalizations: {
                            'tr': '3 Ay',
                            'de': '3 Monate',
                            'fr': '3 Mois',
                            'es-ES': '3 Meses',
                            'ru': '3 Месяца'
                        }
                    },
                    {
                        name: '6 Months',
                        value: '180d',
                        nameLocalizations: {
                            'tr': '6 Ay',
                            'de': '6 Monate',
                            'fr': '6 Mois',
                            'es-ES': '6 Meses',
                            'ru': '6 Месяцев'
                        }
                    },
                    {
                        name: '1 Year',
                        value: '365d',
                        nameLocalizations: {
                            'tr': '1 Yıl',
                            'de': '1 Jahr',
                            'fr': '1 An',
                            'es-ES': '1 Año',
                            'ru': '1 Год'
                        }
                    },
                    {
                        name: 'Lifetime',
                        value: 'lifetime',
                        nameLocalizations: {
                            'tr': 'Ömür Boyu',
                            'de': 'Lebenslang',
                            'fr': 'À Vie',
                            'es-ES': 'De Por Vida',
                            'ru': 'Навсегда'
                        }
                    }
                )),

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

        const type = interaction.options.getString('type');
        const targetId = interaction.options.getString('target_id');
        const duration = interaction.options.getString('duration');

        // Süreyi hesapla
        let durationMs;
        if (duration === 'lifetime') {
            durationMs = 'lifetime';
        } else {
            const days = parseInt(duration);
            durationMs = days * 24 * 60 * 60 * 1000;
        }

        let result;
        let targetName;

        if (type === 'server') {
            result = PremiumManager.addServerPremium(targetId, durationMs, interaction.user.id);
            try {
                const guild = await interaction.client.guilds.fetch(targetId);
                targetName = guild.name;
            } catch {
                targetName = targetId;
            }
        } else {
            result = PremiumManager.addUserPremium(targetId, durationMs, interaction.user.id);
            try {
                const user = await interaction.client.users.fetch(targetId);
                targetName = user.tag;
            } catch {
                targetName = targetId;
            }
        }

        // Localize duration text based on input
        let durationText;
        switch (duration) {
            case '7d':
                durationText = `1 ${lang.week || 'Week'}`;
                break;
            case '30d':
                durationText = `1 ${lang.month || 'Month'}`;
                break;
            case '90d':
                durationText = `3 ${lang.months || 'Months'}`;
                break;
            case '180d':
                durationText = `6 ${lang.months || 'Months'}`;
                break;
            case '365d':
                durationText = `1 ${lang.year || 'Year'}`;
                break;
            case 'lifetime':
                durationText = lang.lifetime || 'Lifetime';
                break;
            default:
                durationText = duration;
        }

        const expiresText = result.expires === 'lifetime'
            ? lang.lifetime
            : `<t:${Math.floor(new Date(result.expires).getTime() / 1000)}:F>`;

        const embed = new EmbedBuilder()
            .setTitle(`${Emojis.DIAMOND || '💎'} ${lang.premium_added}`)
            .setColor(Colors.PREMIUM)
            .setDescription(`${Emojis.CHECK || '✅'} ${lang.premium_success || 'Premium Activated!'}
            
${Emojis.ARROW || '➡️'} **${lang.type}:** ${type === 'server' ? lang.server : lang.user}
${Emojis.ARROW || '➡️'} **${lang.target}:** ${targetName}
${Emojis.ARROW || '➡️'} **ID:** \`${targetId}\`
${Emojis.CLOCK || '⏰'} **${lang.duration || 'Duration'}:** ${durationText}
${Emojis.CLOCK || '⏰'} **${lang.ends_at}:** ${expiresText}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
};
