const { GlobalFonts, createCanvas } = require('@napi-rs/canvas');
const path = require('path');
const { Colors } = require('./constants');

// Load fonts if available, otherwise fallback
// GlobalFonts.registerFromPath(path.join(__dirname, '..', 'assets', 'fonts', 'Inter-Bold.ttf'), 'Inter');

// Helper function to strip emojis from text
function stripEmojis(str) {
    if (!str) return '';
    return str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|🎉|🎁|⏰|👑|🏆|✨|🎊|👥|✅|❌)/g, '').trim();
}

class CanvasManager {
    static async generateGiveawayCard(prize, durationText, hostedBy, lang) {
        const width = 800;
        const height = 300;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Background (Premium Purple-Blue Gradient)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e'); // Dark purple
        gradient.addColorStop(0.5, '#16213e'); // Dark blue
        gradient.addColorStop(1, '#0f3460'); // Deep blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Decorative Border (Subtle glow effect)
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'; // Gold glow
        ctx.lineWidth = 3;
        ctx.strokeRect(15, 15, width - 30, height - 30);

        // 3. Confetti/Sparkle Particles
        const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FFFFFF'];
        for (let i = 0; i < 40; i++) {
            ctx.beginPath();
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 4 + 1;
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            ctx.globalAlpha = Math.random() * 0.6 + 0.2;
            ctx.fill();
        }
        ctx.globalAlpha = 1; // Reset

        // 4. Light streaks (decorative lines)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.lineTo(150, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(width - 150, height);
        ctx.lineTo(width, height - 50);
        ctx.stroke();

        // 5. Title "GIVEAWAY" with Gold gradient effect
        ctx.textAlign = 'center';
        ctx.font = 'bold 42px Sans';

        // Text shadow for depth
        ctx.shadowColor = 'rgba(255, 165, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Gold gradient for title
        const titleGradient = ctx.createLinearGradient(width / 2 - 150, 0, width / 2 + 150, 0);
        titleGradient.addColorStop(0, '#FFD700');
        titleGradient.addColorStop(0.5, '#FFA500');
        titleGradient.addColorStop(1, '#FFD700');
        ctx.fillStyle = titleGradient;

        ctx.fillText('GIVEAWAY', width / 2, 60);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // 6. Prize Name (Main Focus - White, Bold)
        ctx.font = 'bold 52px Sans';
        ctx.fillStyle = '#FFFFFF';

        let displayPrize = stripEmojis(prize);
        if (displayPrize.length > 22) displayPrize = displayPrize.substring(0, 22) + '...';
        ctx.fillText(displayPrize, width / 2, 155);

        // 7. Footer Section (Duration & Host)
        ctx.font = '22px Sans';
        ctx.fillStyle = '#B0B0B0';

        const safeDuration = stripEmojis(durationText);
        const safeHost = stripEmojis(hostedBy);

        // Two column layout
        ctx.fillText(`Ends in: ${safeDuration}`, width / 2 - 120, 240);
        ctx.fillText(`Hosted by: ${safeHost}`, width / 2 + 120, 240);

        // Separator dot
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width / 2, 236, 4, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toBuffer('image/png');
    }

    static async generateWinnerCard(prize, winnerNames, lang) {
        const width = 800;
        const height = 300;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // 1. Background (Celebration Green-Gold Gradient)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0d4524'); // Dark green
        gradient.addColorStop(0.5, '#1a5c32'); // Forest green
        gradient.addColorStop(1, '#2d7a4a'); // Bright green
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Decorative Border (Gold)
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        // 3. Celebration Confetti
        const confettiColors = ['#FFD700', '#FFA500', '#FFFFFF', '#90EE90', '#FF69B4'];
        for (let i = 0; i < 60; i++) {
            ctx.save();
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.fillStyle = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            ctx.globalAlpha = Math.random() * 0.7 + 0.3;
            // Rectangle confetti
            ctx.fillRect(-4, -2, 8, 4);
            ctx.restore();
        }
        ctx.globalAlpha = 1;

        // 4. Trophy/Star decorations on sides
        ctx.font = '60px Sans';
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.textAlign = 'left';
        ctx.fillText('★', 30, 80);
        ctx.textAlign = 'right';
        ctx.fillText('★', width - 30, height - 30);

        // 5. Title "CONGRATULATIONS!" with glow
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 25;

        ctx.font = 'bold 38px Sans';
        ctx.fillStyle = '#FFD700';
        const congratsText = stripEmojis(lang.congratulations || 'CONGRATULATIONS!').toUpperCase();
        ctx.fillText(congratsText, width / 2, 60);

        ctx.shadowBlur = 0;

        // 6. Winner Names (Main Focus)
        ctx.font = 'bold 48px Sans';
        ctx.fillStyle = '#FFFFFF';
        let wName = stripEmojis(winnerNames);
        if (wName.length > 30) wName = wName.substring(0, 30) + '...';
        ctx.fillText(wName, width / 2, 145);

        // 7. Prize Info
        ctx.font = '26px Sans';
        ctx.fillStyle = '#90EE90'; // Light green
        let displayPrize = stripEmojis(prize);
        if (displayPrize.length > 35) displayPrize = displayPrize.substring(0, 35) + '...';
        const prizeLabel = stripEmojis(lang.prize || 'Prize');
        ctx.fillText(`${prizeLabel}: ${displayPrize}`, width / 2, 210);

        // 8. Bottom decorative line
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, 250);
        ctx.lineTo(600, 250);
        ctx.stroke();

        return canvas.toBuffer('image/png');
    }
}

module.exports = { CanvasManager };
