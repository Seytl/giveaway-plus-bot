const fs = require('fs');
const os = require('os');
const { Colors, Emojis } = require('./constants');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const config = require('../config.json');

module.exports = (client) => {
    // ═══════════════════════════════════════════
    //  CONFIGURATION
    // ═══════════════════════════════════════════
    const MAX_ERRORS = 5;                    // Max errors before auto-restart
    const RATE_LIMIT_WINDOW = 10000;         // 10 seconds - if 3 errors in this window, instant restart
    const RATE_LIMIT_COUNT = 3;              // Errors within window to trigger instant restart
    const ERROR_RESET_TIME = 5 * 60 * 1000;  // 5 minutes - reset error counter after stability
    const MEMORY_CHECK_INTERVAL = 60000;     // Check memory every 60 seconds
    const MEMORY_WARN_THRESHOLD = 80;        // Warn at 80% memory usage
    const MEMORY_CRITICAL_THRESHOLD = 95;    // Restart at 95% memory usage

    // ═══════════════════════════════════════════
    //  STATE
    // ═══════════════════════════════════════════
    let errorWebhook = null;
    let errorCount = 0;
    let errorTimestamps = [];
    let lastErrorTime = null;
    let resetTimer = null;
    const startTime = Date.now();

    // Initialize Webhook
    if (config.webhooks?.errorUrl && config.webhooks.errorUrl !== "YOUR_ERROR_WEBHOOK_URL_HERE") {
        try {
            errorWebhook = new WebhookClient({ url: config.webhooks.errorUrl });
        } catch (e) {
            console.error('[ANTI-CRASH] Invalid webhook URL:', e.message);
        }
    }

    // ═══════════════════════════════════════════
    //  HELPER FUNCTIONS
    // ═══════════════════════════════════════════
    const getUptime = () => {
        const ms = Date.now() - startTime;
        const days = Math.floor(ms / 86400000);
        const hours = Math.floor((ms % 86400000) / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const getMemoryUsage = () => {
        const used = process.memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedPercent = ((totalMem - freeMem) / totalMem * 100).toFixed(1);
        return {
            rss: (used.rss / 1024 / 1024).toFixed(2),
            heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2),
            heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2),
            systemPercent: usedPercent,
            systemTotal: (totalMem / 1024 / 1024 / 1024).toFixed(2),
            systemFree: (freeMem / 1024 / 1024 / 1024).toFixed(2)
        };
    };

    const resetErrorCounter = () => {
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            if (errorCount > 0) {
                console.log(`${Emojis.CHECK} [ANTI-CRASH] No errors for 5 minutes. Error counter reset (${errorCount} → 0).`);
                errorCount = 0;
                errorTimestamps = [];
            }
        }, ERROR_RESET_TIME);
    };

    const checkRateLimit = () => {
        const now = Date.now();
        errorTimestamps.push(now);
        // Keep only timestamps within the window
        errorTimestamps = errorTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW);
        return errorTimestamps.length >= RATE_LIMIT_COUNT;
    };

    const triggerRestart = async (reason) => {
        console.log('━'.repeat(50));
        console.log(`🔄 [SYSTEM] Auto-Restart Triggered: ${reason}`);
        console.log('━'.repeat(50));

        fs.appendFileSync('error.log', `[${new Date().toISOString()}] AUTO-RESTART: ${reason}\n`);

        if (errorWebhook) {
            try {
                const mem = getMemoryUsage();
                const restartEmbed = new EmbedBuilder()
                    .setTitle('🔄 System Auto-Restart')
                    .setColor(0xFF0000)
                    .setDescription(`The bot is restarting to ensure stability.`)
                    .addFields(
                        { name: '📋 Reason', value: reason, inline: false },
                        { name: '⏱️ Uptime', value: getUptime(), inline: true },
                        { name: '💾 RAM', value: `${mem.rss} MB`, inline: true },
                        { name: '📊 Error Count', value: `${errorCount}/${MAX_ERRORS}`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Crash System v2.1.0' });

                await errorWebhook.send({ embeds: [restartEmbed] });
            } catch (e) { /* ignore */ }
        }

        // Graceful shutdown: destroy client before exit
        try {
            if (client) client.destroy();
        } catch (e) { /* ignore */ }

        setTimeout(() => process.exit(1), 3000);
    };

    // ═══════════════════════════════════════════
    //  CORE ERROR HANDLER
    // ═══════════════════════════════════════════
    const sendErrorLog = async (title, error, type = 'error') => {
        if (type === 'error') {
            errorCount++;
            lastErrorTime = Date.now();
            resetErrorCounter();
        }

        // Console Log
        console.log('━'.repeat(50));
        console.log(`${type === 'warning' ? Emojis.WARNING : Emojis.CROSS} [ANTI-CRASH] ${title}`);
        console.log(error);
        console.log(`[SYSTEM] Error Count: ${errorCount}/${MAX_ERRORS} | Uptime: ${getUptime()}`);
        console.log('━'.repeat(50));

        // File Log
        const logEntry = `[${new Date().toISOString()}] ${title} (${errorCount}/${MAX_ERRORS}): ${error.stack || error}\n`;
        fs.appendFileSync('error.log', logEntry);

        // Webhook Log
        if (errorWebhook) {
            try {
                const mem = getMemoryUsage();
                const embed = new EmbedBuilder()
                    .setTitle(`${type === 'warning' ? '⚠️ Warning' : '❌ Error'} — ${title}`)
                    .setColor(type === 'warning' ? Colors.WARNING : Colors.ERROR)
                    .setDescription(`\`\`\`js\n${(error.stack || error).toString().slice(0, 3500)}\n\`\`\``)
                    .addFields(
                        { name: '📊 Counter', value: `${errorCount}/${MAX_ERRORS}`, inline: true },
                        { name: '⏱️ Uptime', value: getUptime(), inline: true },
                        { name: '💾 RAM', value: `${mem.rss} MB (Heap: ${mem.heapUsed}/${mem.heapTotal} MB)`, inline: true },
                        { name: '🖥️ System', value: `${mem.systemPercent}% used (${mem.systemFree}/${mem.systemTotal} GB free)`, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Crash System v2.1.0' });

                await errorWebhook.send({ embeds: [embed] });
            } catch (err) {
                console.error('[ANTI-CRASH] Failed to send webhook:', err.message);
            }
        }

        // Rate Limit Check (rapid crash detection)
        if (type === 'error' && checkRateLimit()) {
            return triggerRestart(`Rapid crash detected: ${RATE_LIMIT_COUNT} errors in ${RATE_LIMIT_WINDOW / 1000}s`);
        }

        // Max Error Check
        if (errorCount >= MAX_ERRORS) {
            return triggerRestart(`Maximum error limit (${MAX_ERRORS}) reached`);
        }
    };

    // ═══════════════════════════════════════════
    //  PROCESS EVENT HANDLERS
    // ═══════════════════════════════════════════

    // Unhandled Rejection (Promise errors)
    process.on('unhandledRejection', (reason, p) => {
        sendErrorLog('Unhandled Rejection', reason || new Error('Unknown rejection'));
    });

    // Uncaught Exception (Critical errors)
    process.on('uncaughtException', (err, origin) => {
        sendErrorLog('Uncaught Exception', err);
    });

    // Uncaught Exception Monitor
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        sendErrorLog('Exception Monitor', err, 'warning');
    });

    // Process Warning (Deprecations, memory leaks etc.)
    process.on('warning', (warning) => {
        sendErrorLog('Process Warning', warning, 'warning');
    });

    // Graceful Shutdown (SIGINT = Ctrl+C, SIGTERM = Kill)
    process.on('SIGINT', async () => {
        console.log(`\n${Emojis.WARNING} [SYSTEM] Received SIGINT. Shutting down gracefully...`);

        if (errorWebhook) {
            try {
                const embed = new EmbedBuilder()
                    .setTitle('🛑 Bot Shutting Down')
                    .setColor(Colors.WARNING)
                    .setDescription('The bot received a shutdown signal (SIGINT).')
                    .addFields({ name: '⏱️ Total Uptime', value: getUptime(), inline: true })
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Crash System v2.1.0' });
                await errorWebhook.send({ embeds: [embed] });
            } catch (e) { /* ignore */ }
        }

        try { if (client) client.destroy(); } catch (e) { /* ignore */ }
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log(`${Emojis.WARNING} [SYSTEM] Received SIGTERM. Shutting down gracefully...`);
        try { if (client) client.destroy(); } catch (e) { /* ignore */ }
        process.exit(0);
    });

    // ═══════════════════════════════════════════
    //  DISCORD CLIENT ERROR HANDLERS
    // ═══════════════════════════════════════════

    if (client) {
        // Discord.js Client Error
        client.on('error', (error) => {
            sendErrorLog('Discord Client Error', error);
        });

        // Shard Error (if sharding)
        client.on('shardError', (error, shardId) => {
            sendErrorLog(`Shard ${shardId} Error`, error);
        });

        // Shard Disconnect
        client.on('shardDisconnect', (event, shardId) => {
            console.log(`${Emojis.WARNING} [DISCORD] Shard ${shardId} disconnected (Code: ${event.code}).`);
        });

        // Shard Reconnecting
        client.on('shardReconnecting', (shardId) => {
            console.log(`${Emojis.HOURGLASS} [DISCORD] Shard ${shardId} reconnecting...`);
        });

        // Shard Resume
        client.on('shardResume', (shardId, replayedEvents) => {
            console.log(`${Emojis.CHECK} [DISCORD] Shard ${shardId} resumed (${replayedEvents} events replayed).`);
        });
    }

    // ═══════════════════════════════════════════
    //  MEMORY MONITORING
    // ═══════════════════════════════════════════

    setInterval(() => {
        const mem = getMemoryUsage();
        const percent = parseFloat(mem.systemPercent);

        if (percent >= MEMORY_CRITICAL_THRESHOLD) {
            triggerRestart(`Critical memory usage: ${percent}% (Threshold: ${MEMORY_CRITICAL_THRESHOLD}%)`);
        } else if (percent >= MEMORY_WARN_THRESHOLD) {
            console.log(`${Emojis.WARNING} [MEMORY] High memory usage: ${percent}% | RSS: ${mem.rss} MB | Free: ${mem.systemFree} GB`);

            if (errorWebhook) {
                const embed = new EmbedBuilder()
                    .setTitle('⚠️ High Memory Usage')
                    .setColor(Colors.WARNING)
                    .setDescription(`System memory is at **${percent}%** usage.`)
                    .addFields(
                        { name: '💾 Bot RSS', value: `${mem.rss} MB`, inline: true },
                        { name: '📦 Heap', value: `${mem.heapUsed}/${mem.heapTotal} MB`, inline: true },
                        { name: '🖥️ System', value: `${mem.systemFree} GB free / ${mem.systemTotal} GB total`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Anti-Crash System v2.1.0' });

                errorWebhook.send({ embeds: [embed] }).catch(() => { });
            }
        }
    }, MEMORY_CHECK_INTERVAL);

    // ═══════════════════════════════════════════
    //  STARTUP LOG
    // ═══════════════════════════════════════════
    const mem = getMemoryUsage();
    console.log('━'.repeat(50));
    console.log(`${Emojis.CHECK} [ANTI-CRASH] Module loaded successfully`);
    console.log(`   ├─ Webhook: ${errorWebhook ? '✅ Active' : '❌ Disabled'}`);
    console.log(`   ├─ Max Errors: ${MAX_ERRORS}`);
    console.log(`   ├─ Rate Limit: ${RATE_LIMIT_COUNT} errors / ${RATE_LIMIT_WINDOW / 1000}s`);
    console.log(`   ├─ Memory Monitor: Every ${MEMORY_CHECK_INTERVAL / 1000}s`);
    console.log(`   ├─ Memory Warn: ${MEMORY_WARN_THRESHOLD}% | Critical: ${MEMORY_CRITICAL_THRESHOLD}%`);
    console.log(`   ├─ Error Reset: After ${ERROR_RESET_TIME / 60000} min stability`);
    console.log(`   └─ RAM: ${mem.rss} MB | System: ${mem.systemPercent}%`);
    console.log('━'.repeat(50));
};
