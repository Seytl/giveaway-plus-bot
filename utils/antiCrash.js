const fs = require('fs');
const { Colors, Emojis } = require('./constants');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {
    let errorWebhook = null;
    let errorCount = 0;
    const MAX_ERRORS = 5;

    if (config.webhooks.errorUrl && config.webhooks.errorUrl !== "YOUR_ERROR_WEBHOOK_URL_HERE") {
        errorWebhook = new WebhookClient({ url: config.webhooks.errorUrl });
    }

    const sendErrorLog = async (title, error, type = 'error') => {
        // Increment error count for critical errors
        if (type === 'error') {
            errorCount++;
        }

        // Console Log
        console.log('━'.repeat(50));
        console.log(`${type === 'warning' ? Emojis.WARNING : Emojis.CROSS} [ANTI-CRASH] ${title}`);
        console.log(error);
        console.log(`[SYSTEM] Error Count: ${errorCount}/${MAX_ERRORS}`);
        console.log('━'.repeat(50));

        // File Log
        const logEntry = `[${new Date().toISOString()}] ${title} (${errorCount}/${MAX_ERRORS}): ${error.stack || error}\n`;
        fs.appendFileSync('error.log', logEntry);

        // Webhook Log
        if (errorWebhook) {
            try {
                const embed = new EmbedBuilder()
                    .setTitle(`${type === 'warning' ? '⚠️ Warning' : '❌ Critical Error'} - ${title}`)
                    .setColor(type === 'warning' ? Colors.WARNING : Colors.ERROR)
                    .setDescription(`\`\`\`js\n${(error.stack || error).toString().slice(0, 4000)}\n\`\`\``)
                    .addFields({ name: 'Error Counter', value: `${errorCount}/${MAX_ERRORS}`, inline: true })
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Crash System' });

                await errorWebhook.send({
                    content: type === 'error' ? '<@&YOUR_DEV_ROLE_ID>' : null,
                    embeds: [embed]
                });
            } catch (err) {
                console.error('[ANTI-CRASH] Failed to send webhook:', err);
            }
        }

        // Auto-Restart Check
        if (errorCount >= MAX_ERRORS) {
            console.log(`${Emojis.REFRESH} [SYSTEM] Maximum error limit reached. Restarting...`);

            if (errorWebhook) {
                const restartEmbed = new EmbedBuilder()
                    .setTitle('🔄 System Auto-Restart')
                    .setColor(Colors.PRIMARY)
                    .setDescription(`Maximum error limit (${MAX_ERRORS}) reached. The bot is restarting to ensure stability.`)
                    .setTimestamp();

                try {
                    await errorWebhook.send({ embeds: [restartEmbed] });
                } catch (e) { /* ignore */ }
            }

            // Allow time for webhook to send
            setTimeout(() => {
                process.exit(1);
            }, 3000);
        }
    };

    // Unhandled Rejection
    process.on('unhandledRejection', (reason, p) => {
        sendErrorLog('Unhandled Rejection/Catch', reason);
    });

    // Uncaught Exception
    process.on('uncaughtException', (err, origin) => {
        sendErrorLog('Uncaught Exception/Catch', err);
    });

    // Uncaught Exception Monitor
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        sendErrorLog('Uncaught Exception Monitor', err, 'warning');
    });

    // Warning
    process.on('warning', (warning) => {
        sendErrorLog('Process Warning', warning, 'warning');
    });

    console.log(`${Emojis.CHECK} [SYSTEM] Anti-Crash module loaded successfully (Webhook: ${errorWebhook ? 'Active' : 'Disabled'}).`);
};
