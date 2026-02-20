const { SlashCommandBuilder, EmbedBuilder , MessageFlags } = require('discord.js');
const { exec } = require('child_process');
const config = require('../config.json');
const { LanguageManager } = require('../utils/languageManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        // Slash command descriptions must be static. We use English/primary one or the existing one.
        // Since the file is being overwritten, I'll use a generic one.
        .setDescription('Updates the bot from GitHub (Owner Only) / Botu günceller'),
    async execute(interaction) {
        const guildId = interaction.guildId;

        // 1. Yetki Kontrolü
        if (!config.owners.includes(interaction.user.id)) {
            return interaction.reply({
                content: LanguageManager.get(guildId, 'update_owner_only') || '❌ You do not have permission!',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // 2. Git Pull Komutunu Çalıştır
        exec('git pull', async (error, stdout, stderr) => {
            const embed = new EmbedBuilder()
                .setTitle(LanguageManager.get(guildId, 'update_title') || '📢 Update Status')
                .setColor(config.embedColor || '#5865F2')
                .setTimestamp();

            if (error) {
                console.error(`Update Error: ${error}`);
                const errorMsg = LanguageManager.get(guildId, 'update_error') || '❌ Error Occurred:';
                embed.setDescription(`${errorMsg}\n\`\`\`bash\n${error.message}\n\`\`\``)
                    .setColor('#ED4245');
                return interaction.editReply({ embeds: [embed] });
            }

            // Çıktıyı kontrol et
            const output = stdout.trim();

            if (output.includes('Already up to date') || output.includes('Already up-to-date')) {
                embed.setDescription(LanguageManager.get(guildId, 'update_already_up_to_date') || '✅ Bot is already up to date!')
                    .setColor('#57F287');
                return interaction.editReply({ embeds: [embed] });
            }

            // Güncelleme varsa
            let successMsg = LanguageManager.get(guildId, 'update_success');
            if (!successMsg) {
                successMsg = '🚀 **Update Successful!**\n\n**Changes:**\n```bash\n{output}\n```\n\n🔄 **Restarting Bot...**';
            }

            // Replace placeholder manually if LanguageManager doesn't handle it in this specific way (it should, but safety first)
            successMsg = successMsg.replace('{output}', output.substring(0, 1000));

            embed.setDescription(successMsg)
                .setColor('#FEE75C');

            await interaction.editReply({ embeds: [embed] });

            // 3. Botu Yeniden Başlat (Process Exit)
            console.log('Update successful, restarting process...');
            setTimeout(() => {
                process.exit(0);
            }, 2000);
        });
    }
};
