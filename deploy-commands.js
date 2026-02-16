/**
 * Slash Komutları Deploy Script
 * Bu scripti çalıştırarak slash komutlarını Discord'a kaydedin.
 */

const { REST, Routes } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Recursively get all command files
function getCommandFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        if (item.isDirectory()) {
            files = [...files, ...getCommandFiles(path.join(dir, item.name))];
        } else if (item.name.endsWith('.js')) {
            files.push(path.join(dir, item.name));
        }
    }
    return files;
}

const commandFiles = getCommandFiles(commandsPath);

for (const file of commandFiles) {
    const command = require(file);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[UYARI] ${file} dosyasındaki komut 'data' veya 'execute' özelliğine sahip değil.`);
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('🔄 Slash komutları kaydediliyor...');

        // Global komutları kaydet
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );

        console.log('✅ Slash komutları başarıyla kaydedildi!');
        console.log(`📋 Toplam ${commands.length} komut kaydedildi.`);
    } catch (error) {
        console.error('❌ Komut kayıt hatası:', error);
    }
})();
