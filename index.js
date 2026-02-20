/**
 * 🎉 Advanced Giveaway Bot v2.1.0
 * Discord.js v14 - Global Slash Commands Only
 * 
 * Modular Structure - Slash Commands Only
 * Developer: Anarvion
 */

const {
    Client,
    Events,
    GatewayIntentBits,
    Collection,
    EmbedBuilder,
    PermissionFlagsBits,
    ActivityType,
    SlashCommandBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

// Utils
const { GiveawayManager } = require('./utils/GiveawayManager');
const { GiveawayComponentsV2 } = require('./utils/componentsV2');
const { Colors, Emojis } = require('./utils/constants');
const { PremiumManager } = require('./utils/database');
const { LanguageManager } = require('./utils/languageManager');
const { formatTimestamp, formatFullDate } = require('./utils/time');

// Client oluşturma - Global bot için optimize edilmiş intent'ler
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Collections
client.commands = new Collection();
client.giveaways = new Collection();

// Komutları yükle
const giveawayCommands = {};
const blacklistCommands = {};
const premiumCommands = {};

// Giveaway komutlarını yükle
const giveawayCommandsPath = path.join(__dirname, 'commands', 'giveaway');
if (fs.existsSync(giveawayCommandsPath)) {
    const giveawayFiles = fs.readdirSync(giveawayCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of giveawayFiles) {
        const command = require(path.join(giveawayCommandsPath, file));
        giveawayCommands[command.data.name] = command;
        console.log(`[COMMAND] Giveaway command loaded: ${command.data.name}`);
    }
}

// Blacklist komutlarını yükle
const blacklistCommandsPath = path.join(__dirname, 'commands', 'blacklist');
if (fs.existsSync(blacklistCommandsPath)) {
    const blacklistFiles = fs.readdirSync(blacklistCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of blacklistFiles) {
        const command = require(path.join(blacklistCommandsPath, file));
        blacklistCommands[command.data.name] = command;
        console.log(`[COMMAND] Blacklist command loaded: ${command.data.name}`);
    }
}

// Premium komutlarını yükle
const premiumCommandsPath = path.join(__dirname, 'commands', 'premium');
if (fs.existsSync(premiumCommandsPath)) {
    const premiumFiles = fs.readdirSync(premiumCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of premiumFiles) {
        const command = require(path.join(premiumCommandsPath, file));
        premiumCommands[command.data.name] = command;
        console.log(`[COMMAND] Premium command loaded: ${command.data.name}`);
    }
}

// Çekiliş yöneticisini oluştur
let giveawayManager;

// Bot hazır
client.once(Events.ClientReady, async () => {
    console.log('━'.repeat(50));
    console.log(`${Emojis.CHECK} Bot successfully started!`);
    console.log(`${Emojis.ARROW} User: ${client.user.tag}`);
    console.log(`${Emojis.ARROW} Server Count: ${client.guilds.cache.size}`);

    // Çekiliş yöneticisini başlat
    giveawayManager = new GiveawayManager(client);

    console.log(`${Emojis.ARROW} Active Giveaways: ${giveawayManager.getActiveGiveaways().length}`);
    console.log(`${Emojis.ARROW} Loaded Giveaway Commands: ${Object.keys(giveawayCommands).length}`);
    console.log(`${Emojis.ARROW} Loaded Blacklist Commands: ${Object.keys(blacklistCommands).length}`);
    console.log(`${Emojis.ARROW} Loaded Premium Commands: ${Object.keys(premiumCommands).length}`);
    console.log(`${Emojis.ROCKET} Global Bot Mode: Active`);
    console.log('━'.repeat(50));

    // Durum ayarla (Döngüsel)
    let statusIndex = 0;
    const updatePresence = () => {
        const activeCount = giveawayManager.getActiveGiveaways().length;
        const serverCount = client.guilds.cache.size;
        const memberCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

        const activities = [
            { name: `🎉 ${activeCount} Giveaways | ${serverCount} Servers`, type: ActivityType.Watching },
            { name: `👥 ${memberCount} Users`, type: ActivityType.Watching },
            { name: `/giveaway | /help`, type: ActivityType.Playing },
            { name: `🚀 Ultimate Giveaway Bot`, type: ActivityType.Competing },
            { name: `Sponsored by Hostimux.com`, type: ActivityType.Playing }
        ];

        const activity = activities[statusIndex];
        client.user.setPresence({
            activities: [activity],
            status: 'online'
        });

        statusIndex = (statusIndex + 1) % activities.length;
    };

    updatePresence();
    // Her 10 saniyede bir durumu güncelle (Daha dinamik hissettirir)
    setInterval(updatePresence, 10000);

    // Global Slash komutlarını kaydet
    const commands = [];

    // 1. Giveaway Komutları (Dynamic)
    const giveawayCommand = new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Çekiliş komutları')
        .setDMPermission(false);

    // toJSON ve options manipülasyonu ile alt komutları ekle
    const giveawayJSON = giveawayCommand.toJSON();
    giveawayJSON.options = Object.values(giveawayCommands).map(cmd => cmd.data.toJSON());
    commands.push(giveawayJSON);

    // 2. Blacklist Komutları (Dynamic)
    const blacklistCommand = new SlashCommandBuilder()
        .setName('gblacklist')
        .setDescription('Çekiliş kara listesi yönetimi')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

    const blacklistJSON = blacklistCommand.toJSON();
    blacklistJSON.options = Object.values(blacklistCommands).map(cmd => cmd.data.toJSON());
    commands.push(blacklistJSON);

    // 3. Premium Komutları (Dynamic)
    const premiumCommand = new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Premium üyelik yönetimi')
        .setDMPermission(false);

    const premiumJSON = premiumCommand.toJSON();
    premiumJSON.options = Object.values(premiumCommands).map(cmd => cmd.data.toJSON());
    commands.push(premiumJSON);

    // 4. Diğer Statik Komutlar (Root commands ve manuel eklenenler)
    // commands klasöründeki .js dosyalarını (alt klasör olmayan) yükle
    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) {
                // Manuel olarak eklemek yerine listeye pushla
                commands.push(command.data.toJSON());
                console.log(`[COMMAND] Root command loaded: ${command.data.name}`);
            }
        }
    }

    try {
        console.log(`${Emojis.HOURGLASS} Registering global slash commands...`);
        await client.application.commands.set(commands);
        console.log(`${Emojis.CHECK} Global slash commands successfully registered!`);
        console.log(`${Emojis.INFO} Total ${commands.length} commands registered.`);
    } catch (error) {
        console.error('[COMMANDS] Command registration error:', error);
    }
});

// Bot etiketlendiğinde yanıt ver (Mention Response)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // Mesaj takip (Message Tracking)
    if (message.guild) {
        const { MessageManager } = require('./utils/messageManager');
        MessageManager.addMessage(message.guild.id, message.author.id);
    }

    // Sadece bot etiketlendiyse (başka yazı yoksa)
    if (message.content.trim() === `<@${client.user.id}>`) {
        const lang = LanguageManager.getLang(message.guildId);
        const response = (lang.mention_response || "Hello! Use /help to get started.")
            .replace('{user}', message.author.username)
            .replace('{bot}', client.user.username);

        // Basit şık bir embed veya düz mesaj
        const embed = new EmbedBuilder()
            .setColor(Colors.PRIMARY)
            .setDescription(response)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() });

        message.reply({ embeds: [embed] }).catch(() => { });
    }
});

// Slash komut işleyicisi
client.on('interactionCreate', async (interaction) => {
    // Autocomplete işleyicisi
    if (interaction.isAutocomplete()) {
        const focusedOption = interaction.options.getFocused(true);

        // Giveaway ID Autocomplete
        if (focusedOption.name === 'id') {
            const giveaways = giveawayManager.getActiveGiveaways(interaction.guildId);
            const choices = giveaways
                .slice(0, 25)
                .map(g => ({
                    name: `${g.prize} (${g.id})`,
                    value: g.id
                }));

            await interaction.respond(choices);
        }

        // Template Name Autocomplete (giveaway start/delete template)
        else if (focusedOption.name === 'name') {
            const { TemplateManager } = require('./utils/templateManager');
            const templates = TemplateManager.getTemplates(interaction.guildId);
            const filtered = templates.filter(t => t.name.toLowerCase().includes(focusedOption.value.toLowerCase()));

            const choices = filtered
                .slice(0, 25)
                .map(t => ({
                    name: t.name,
                    value: t.name
                }));

            await interaction.respond(choices);
        }

        // Language Key Autocomplete
        else if (focusedOption.name === 'key') {
            const { LanguageManager } = require('./utils/languageManager');
            const editableKeys = LanguageManager.getEditableKeys();
            const filtered = editableKeys.filter(k => k.key.includes(focusedOption.value) || k.description.includes(focusedOption.value));

            const choices = filtered
                .slice(0, 25)
                .map(k => ({
                    name: `${k.key} (${k.description})`,
                    value: k.key
                }));

            await interaction.respond(choices);
        }

        return;
    }

    // Slash Commands
    if (interaction.isChatInputCommand()) {
        const { commandName, options } = interaction;


        // Root Level Commands (help, ping, invite, botinfo etc.)
        // These are loaded dynamically below.

        // Dynamic Root Command Handler
        const commandsPath = path.join(__dirname, 'commands');
        const commandFile = path.join(commandsPath, `${commandName}.js`);

        if (fs.existsSync(commandFile)) {
            try {
                const command = require(commandFile);
                if (command.execute) {
                    await command.execute(interaction, giveawayManager);
                    return; // Exit after successful execution
                }
            } catch (error) {
                console.error(`[COMMAND] ${commandName} error:`, error);
                const errorEmbed = GiveawayComponentsV2.createErrorEmbed('Error', 'An error occurred while executing the command.');
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                } else {
                    await interaction.editReply({ embeds: [errorEmbed] }).catch(() => { });
                }
            }
        }


        // Giveaway komutları
        if (commandName === 'giveaway') {
            const subcommandGroup = options.getSubcommandGroup(false);
            const subcommand = options.getSubcommand(false);

            // Subcommand Group kontrolü (template komutu için)
            if (subcommandGroup === 'template') {
                if (giveawayCommands['template']) {
                    try {
                        await giveawayCommands['template'].execute(interaction, giveawayManager);
                    } catch (error) {
                        console.error(`[GIVEAWAY] Template ${subcommand} error:`, error);
                        const errorEmbed = GiveawayComponentsV2.createErrorEmbed('Error', 'An error occurred while executing the command.');
                        if (interaction.replied || interaction.deferred) {
                            await interaction.editReply({ embeds: [errorEmbed] }).catch(() => { });
                        } else {
                            await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                        }
                    }
                }
            } else {
                // Standart giveaway komutları
                if (giveawayCommands[subcommand]) {
                    try {
                        await giveawayCommands[subcommand].execute(interaction, giveawayManager);
                    } catch (error) {
                        console.error(`[GIVEAWAY] ${subcommand} command error:`, error);
                        const errorEmbed = GiveawayComponentsV2.createErrorEmbed('Error', 'An error occurred while executing the command.');
                        if (interaction.replied || interaction.deferred) {
                            await interaction.editReply({ embeds: [errorEmbed] }).catch(() => { });
                        } else {
                            await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                        }
                    }
                }
            }
        }

        // Blacklist komutları
        else if (commandName === 'gblacklist') {
            const subcommand = options.getSubcommand();

            if (blacklistCommands[subcommand]) {
                try {
                    await blacklistCommands[subcommand].execute(interaction);
                } catch (error) {
                    console.error(`[BLACKLIST] ${subcommand} command error:`, error);
                    const errorEmbed = GiveawayComponentsV2.createErrorEmbed('Error', 'An error occurred while executing the command.');
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [errorEmbed] }).catch(() => { });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                    }
                }
            }
        }

        // Premium komutları
        else if (commandName === 'premium') {
            const subcommand = options.getSubcommand();

            if (premiumCommands[subcommand]) {
                try {
                    await premiumCommands[subcommand].execute(interaction);
                } catch (error) {
                    console.error(`[PREMIUM] ${subcommand} command error:`, error);
                    const errorEmbed = GiveawayComponentsV2.createErrorEmbed('Error', 'An error occurred while executing the command.');
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply({ embeds: [errorEmbed] }).catch(() => { });
                    } else {
                        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                    }
                }
            }
        }

        // Language komutu
        else if (commandName === 'language') {
            try {
                const languageCommand = require('./commands/language.js');
                await languageCommand.execute(interaction);
            } catch (error) {
                console.error('[LANGUAGE] Command error:', error);
                const errorEmbed = GiveawayComponentsV2.createErrorEmbed('Error', 'An error occurred while executing the command.');
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [errorEmbed] }).catch(() => { });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => { });
                }
            }
        }
    }

    // Button interactions
    else if (interaction.isButton()) {
        const [action, type, giveawayId] = interaction.customId.split('_');

        if (action !== 'giveaway') return;

        const lang = LanguageManager.getLang(interaction.guildId);

        // Join butonu
        if (type === 'join') {
            const giveaway = giveawayManager.getGiveaway(giveawayId);

            if (!giveaway || giveaway.ended) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_or_ended)],
                    ephemeral: true
                });
            }

            // Survey Kontrolü
            if (giveaway.type === 'SURVEY' && giveaway.surveyQuestion && !giveaway.participants.includes(interaction.user.id)) {
                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

                const modal = new ModalBuilder()
                    .setCustomId(`survey_${giveawayId}`)
                    .setTitle(lang.survey_modal_title || 'Giveaway Survey');

                const answerInput = new TextInputBuilder()
                    .setCustomId('answer')
                    .setLabel(giveaway.surveyQuestion.slice(0, 45)) // Label limit
                    .setPlaceholder(lang.survey_placeholder || 'Type your answer...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const firstActionRow = new ActionRowBuilder().addComponents(answerInput);
                modal.addComponents(firstActionRow);

                await interaction.showModal(modal);
                return;
            }

            const result = await giveawayManager.addParticipant(giveawayId, interaction.user.id);

            if (result.success) {
                const giveaway = giveawayManager.getGiveaway(giveawayId);
                const embed = GiveawayComponentsV2.createJoinEmbed(interaction.user, giveaway, result.entryCount, lang);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                if (result.alreadyJoined) {
                    await interaction.reply({
                        embeds: [GiveawayComponentsV2.createInfoEmbed(lang.already_joined, lang.already_joined_desc)],
                        ephemeral: true
                    });
                } else {
                    // Hata mesajını dil dosyasından almaya çalış
                    const reason = lang[result.reason] || result.reason || lang.error;
                    await interaction.reply({
                        embeds: [GiveawayComponentsV2.createErrorEmbed(lang.join_failed, reason)],
                        ephemeral: true
                    });
                }
            }
        }

        // Leave butonu
        else if (type === 'leave') {
            const result = await giveawayManager.removeParticipant(giveawayId, interaction.user.id);

            if (result.success) {
                const giveaway = giveawayManager.getGiveaway(giveawayId);
                const embed = GiveawayComponentsV2.createLeaveEmbed(interaction.user, giveaway, lang);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const reason = lang[result.reason] || result.reason || lang.error;
                await interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.leave_failed, reason)],
                    ephemeral: true
                });
            }
        }

        // Info butonu
        else if (type === 'info') {
            const giveaway = giveawayManager.getGiveaway(giveawayId);

            if (!giveaway) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, lang.giveaway_not_found)],
                    ephemeral: true
                });
            }

            const isParticipant = giveaway.participants.includes(interaction.user.id);
            let entryCount = 1;

            if (isParticipant && giveaway.bonusEntries && giveaway.bonusEntries.length > 0) {
                const member = interaction.member;
                for (const bonus of giveaway.bonusEntries) {
                    if (member.roles.cache.has(bonus.roleId)) {
                        entryCount += bonus.entries;
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(`${Emojis.INFO} ${lang.participation_status}`)
                .setColor(isParticipant ? Colors.SUCCESS : Colors.WARNING)
                .setDescription(`${Emojis.GIFT} **${lang.prize}:** ${giveaway.prize}
${isParticipant ? `${Emojis.CHECK} **${lang.status}:** ${lang.joined}` : `${Emojis.CROSS} **${lang.status}:** ${lang.not_participated}`}
${isParticipant ? `${Emojis.ENTRY} **${lang.your_entries}:** \`${entryCount}\`` : ''}
${Emojis.USERS} **${lang.total_participants}:** \`${giveaway.participants.length}\`
${Emojis.CLOCK} **${lang.ends_at}:** ${formatTimestamp(new Date(giveaway.endTime))}`)
                .setFooter({ text: `${lang.giveaway_id}: ${giveaway.id}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Reroll butonu
        else if (type === 'reroll') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.permission_error, lang.manage_server_required)],
                    ephemeral: true
                });
            }

            const result = await giveawayManager.reroll(giveawayId, 1);

            if (result.success) {
                await interaction.reply({
                    embeds: [GiveawayComponentsV2.createSuccessEmbed(lang.rerolled, `${lang.new_winner}: ${result.winners.map(w => `<@${w}>`).join(', ')}`)],
                    ephemeral: true
                });
            } else {
                const reason = lang[result.reason] || result.reason || lang.error;
                await interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, reason)],
                    ephemeral: true
                });
            }
        }

        // Drop Claim butonu
        else if (type === 'claim') {
            const result = await giveawayManager.claimDrop(giveawayId, interaction.user.id);

            if (result.success) {
                const giveaway = giveawayManager.getGiveaway(giveawayId);
                const embed = new EmbedBuilder()
                    .setColor(Colors.SUCCESS)
                    .setTitle(`🎉 ${lang.congratulations || 'Congratulations!'}`)
                    .setDescription(`${lang.drop_winner || 'You won the drop!'} **${giveaway.prize}**`)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                // Hata mesajını dil dosyasından almaya çalış
                const reason = lang[result.reason] || result.reason || lang.error;
                await interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.error, reason)],
                    ephemeral: true
                });
            }
        }
    }

    // Modal Submit Handler
    else if (interaction.isModalSubmit()) {
        const [type, giveawayId] = interaction.customId.split('_');

        if (type === 'survey') {
            const lang = LanguageManager.getLang(interaction.guildId);

            // Cevabı kaydet (basitçe logla veya DB'ye yaz - MVP için şimdilik sadece katılımcı ekliyoruz)
            // const answer = interaction.fields.getTextInputValue('answer');

            const result = await giveawayManager.addParticipant(giveawayId, interaction.user.id);

            if (result.success) {
                const giveaway = giveawayManager.getGiveaway(giveawayId);
                const embed = GiveawayComponentsV2.createJoinEmbed(interaction.user, giveaway, result.entryCount, lang);

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const reason = lang[result.reason] || result.reason || lang.error;
                await interaction.reply({
                    embeds: [GiveawayComponentsV2.createErrorEmbed(lang.join_failed, reason)],
                    ephemeral: true
                });
            }
        }

        // Report Modal Handler
        else if (interaction.customId === 'report_modal') {
            const reportCommand = require('./commands/report.js');
            await reportCommand.handleModalSubmit(interaction);
        }

        // Appeal Modal Handler
        else if (interaction.customId === 'appeal_modal') {
            const appealCommand = require('./commands/appeal.js');
            await appealCommand.handleModalSubmit(interaction);
        }
    }
});

// Yeni sunucuya katılma
client.on('guildCreate', (guild) => {
    console.log(`${Emojis.CHECK} Joined new server: ${guild.name} (${guild.id})`);
});

// Sunucudan ayrılma
client.on('guildDelete', (guild) => {
    console.log(`${Emojis.WARNING} Left server: ${guild.name} (${guild.id})`);
});

// Anti-Crash Modülünü Yükle
require('./utils/antiCrash')(client);

// Bot giriş
client.login(config.token);
