/**
 * Slash Komutları Deploy Script
 * Bu scripti çalıştırarak slash komutlarını Discord'a kaydedin.
 */

const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];

// 1. Giveaway Komutlarını Hazırla (/giveaway)
const giveawayCommandsPath = path.join(__dirname, 'commands', 'giveaway');
if (fs.existsSync(giveawayCommandsPath)) {
    const giveawayFiles = fs.readdirSync(giveawayCommandsPath).filter(file => file.endsWith('.js'));

    // Parent command definition
    const giveawayCommand = new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Çekiliş komutları')
        .setDMPermission(false);

    // Manually construct the JSON options for subcommands
    const giveawayJSON = giveawayCommand.toJSON();
    giveawayJSON.options = [];

    for (const file of giveawayFiles) {
        const command = require(path.join(giveawayCommandsPath, file));
        if (command.data) {
            giveawayJSON.options.push(command.data.toJSON());
        }
    }
    commands.push(giveawayJSON);
    console.log(`📦 /giveaway komutu hazırlandı (${giveawayFiles.length} alt komut)`);
}

// 2. Blacklist Komutlarını Hazırla (/gblacklist)
const blacklistCommandsPath = path.join(__dirname, 'commands', 'blacklist');
if (fs.existsSync(blacklistCommandsPath)) {
    const blacklistFiles = fs.readdirSync(blacklistCommandsPath).filter(file => file.endsWith('.js'));

    const blacklistCommand = new SlashCommandBuilder()
        .setName('gblacklist')
        .setDescription('Çekiliş kara listesi yönetimi')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

    const blacklistJSON = blacklistCommand.toJSON();
    blacklistJSON.options = [];

    for (const file of blacklistFiles) {
        const command = require(path.join(blacklistCommandsPath, file));
        if (command.data) {
            blacklistJSON.options.push(command.data.toJSON());
        }
    }
    commands.push(blacklistJSON);
    console.log(`📦 /gblacklist komutu hazırlandı (${blacklistFiles.length} alt komut)`);
}

// 3. Premium Komutlarını Hazırla (/premium)
const premiumCommandsPath = path.join(__dirname, 'commands', 'premium');
if (fs.existsSync(premiumCommandsPath)) {
    const premiumFiles = fs.readdirSync(premiumCommandsPath).filter(file => file.endsWith('.js'));

    const premiumCommand = new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Premium üyelik yönetimi')
        .setDMPermission(false);

    const premiumJSON = premiumCommand.toJSON();
    premiumJSON.options = [];

    for (const file of premiumFiles) {
        const command = require(path.join(premiumCommandsPath, file));
        if (command.data) {
            premiumJSON.options.push(command.data.toJSON());
        }
    }
    commands.push(premiumJSON);
    console.log(`📦 /premium komutu hazırlandı (${premiumFiles.length} alt komut)`);
}

// 4. Diğer Kök Komutları Hazırla (commands/*.js)
const commandsPath = path.join(__dirname, 'commands');
const rootFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of rootFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`📦 /${command.data.name} komutu eklendi`);
    }
}


const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`🔄 Toplam ${commands.length} ana komut kaydediliyor...`);

        // Global komutları kaydet
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );

        console.log('✅ Slash komutları başarıyla kaydedildi!');
    } catch (error) {
        console.error('❌ Komut kayıt hatası:', error);
    }
})();
