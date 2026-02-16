// Zaman formatlama fonksiyonu
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün ${hours % 24} saat ${minutes % 60} dakika`;
    if (hours > 0) return `${hours} saat ${minutes % 60} dakika`;
    if (minutes > 0) return `${minutes} dakika ${seconds % 60} saniye`;
    return `${seconds} saniye`;
}

// Zaman ayrıştırma fonksiyonu
function parseTime(timeStr) {
    const regex = /(\d+)\s*(s|sn|saniye|m|dk|dakika|h|sa|saat|d|g|gün|w|hf|hafta)/gi;
    let totalMs = 0;
    let match;

    while ((match = regex.exec(timeStr)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 's':
            case 'sn':
            case 'saniye':
                totalMs += value * 1000;
                break;
            case 'm':
            case 'dk':
            case 'dakika':
                totalMs += value * 60 * 1000;
                break;
            case 'h':
            case 'sa':
            case 'saat':
                totalMs += value * 60 * 60 * 1000;
                break;
            case 'd':
            case 'g':
            case 'gün':
                totalMs += value * 24 * 60 * 60 * 1000;
                break;
            case 'w':
            case 'hf':
            case 'hafta':
                totalMs += value * 7 * 24 * 60 * 60 * 1000;
                break;
        }
    }

    return totalMs;
}

// Discord timestamp formatı
function formatTimestamp(date) {
    return `<t:${Math.floor(date / 1000)}:R>`;
}

// Tam tarih formatı
function formatFullDate(date) {
    return `<t:${Math.floor(date / 1000)}:F>`;
}

module.exports = {
    formatDuration,
    parseTime,
    formatTimestamp,
    formatFullDate
};
