const fs = require('fs');
const { Colors, Emojis } = require('./constants');

module.exports = (client) => {
    // Unhandled Rejection: Promise errors (logs but doesn't crash the bot)
    process.on('unhandledRejection', (reason, p) => {
        console.log('━'.repeat(50));
        console.log(`${Emojis.CROSS} [ANTI-CRASH] Unhandled Rejection/Catch`);
        console.log(reason, p);
        console.log('━'.repeat(50));

        fs.appendFileSync('error.log', `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
    });

    // Uncaught Exception: Critical errors (normally crashes the bot)
    process.on('uncaughtException', (err, origin) => {
        console.log('━'.repeat(50));
        console.log(`${Emojis.CROSS} [ANTI-CRASH] Uncaught Exception/Catch`);
        console.log(err, origin);
        console.log('━'.repeat(50));

        fs.appendFileSync('error.log', `[${new Date().toISOString()}] Uncaught Exception: ${err.stack}\n`);
    });

    // Uncaught Exception Monitor: Exception monitoring
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        console.log('━'.repeat(50));
        console.log(`${Emojis.WARNING} [ANTI-CRASH] Uncaught Exception Monitor`);
        console.log(err, origin);
        console.log('━'.repeat(50));
    });

    console.log(`${Emojis.CHECK} [SYSTEM] Anti-Crash module loaded successfully.`);
};
