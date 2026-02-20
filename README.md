# 🎉 Giveaway + Premium Giveaway Bot By Anarvion

Professional and comprehensive giveaway bot developed with Discord.js v14.

![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-GPLv3-blue?style=for-the-badge)

---

## ✨ Features

### 🎯 Core Features
- ✅ **Slash Commands** - Modern Discord slash command support
- ✅ **Button Entry** - One-click giveaway entry
- ✅ **Multi-Winner** - Multiple winners in a single giveaway
- ✅ **Auto-End** - Automatic winner selection when time expires
- ✅ **DM Notification** - Automatic DM sent to winners

### 🔒 Conditional Giveaway System
- ✅ **Role Requirement** - Mandatory role to join
- ✅ **Account Age** - Minimum Discord account age check
- ✅ **Server Age** - Minimum server membership duration check
- ✅ **Blacklisted Roles** - Block specific roles from joining

### 💫 Bonus Entry System
- ✅ **Role Based Bonus** - Extra entries for specific roles
- ✅ **Tiered Bonus** - Define multiple bonus roles
- ✅ **Auto Calculation** - Weighted entries during winner selection

### 📊 Statistics and History
- ✅ **Detailed Stats** - Total giveaways, participants, winners counts
- ✅ **Giveaway History** - Log of the last 100 giveaways
- ✅ **Most Popular** - Track giveaways with the most entries
- ✅ **Top Winner** - Track users with the most wins

### 🛡️ Security
- ✅ **Blacklist** - Block unwanted users
- ✅ **Permission Control** - Authority system for commands
- ✅ **Anti-Cheat** - Prevent double entries
- ✅ **Blacklist Appeal** - `/appeal` command for users to request unban

### 🛡️ Anti-Crash System v2.1.0
- ✅ **Error Handling** - Catches `unhandledRejection`, `uncaughtException`, and process warnings
- ✅ **Webhook Reporting** - Sends error details to a Discord channel via Webhook in real-time
- ✅ **Auto-Restart** - Automatically restarts after 5 critical errors
- ✅ **Rapid Crash Detection** - Instant restart if 3 errors occur within 10 seconds
- ✅ **Memory Monitoring** - Checks RAM every 60s, warns at 80%, restarts at 95%
- ✅ **Error Counter Reset** - Counter resets to 0 after 5 minutes of stability
- ✅ **Discord Client Errors** - Handles shard disconnect, reconnect, and client errors
- ✅ **Graceful Shutdown** - Clean shutdown on SIGINT/SIGTERM signals
- ✅ **Dual Logging** - Errors saved to `error.log` AND sent to Discord webhook

### 🌍 Multi-Language Support
- ✅ **15 Languages** - EN, TR, DE, ES, ES-AR, FR, IT, PT, NL, FI, SV, RU, JA, ZH, AZ
- ✅ **Fallback System** - Missing translations automatically fall back to English
- ✅ **Custom Translations** - Server-specific text customization

### 🎨 Visual Features
- ✅ **Premium Embeds** - Professional looking messages with rich fields
- ✅ **Custom Images** - Add images to giveaways
- ✅ **Emoji Support** - Rich emoji usage
- ✅ **Live Updates** - Real-time participant count updates

### 🔧 Management
- ✅ **Auto-Update** - `/update` command to pull latest changes from GitHub
- ✅ **Bug Report** - `/report` command to report bugs via webhook
- ✅ **Privacy & ToS** - Built-in `/privacy` and `/tos` commands

---

## 📦 Installation

### Requirements
- Node.js v18 or higher
- Discord Bot Token
- Discord Application ID

### Step 1: Download Files
```bash
# Extract the zip file
unzip giveaway-bot.zip
cd giveaway-bot
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Bot Configuration
Edit the `config.json` file:
```json
{
    "token": "YOUR_BOT_TOKEN_HERE",
    "clientId": "YOUR_CLIENT_ID_HERE",
    "owners": ["YOUR_OWNER_ID_HERE"]
}
```

### Step 4: Register Slash Commands
```bash
npm run deploy
```

### Step 5: Start the Bot
```bash
npm start
```

---

## 🤖 Creating a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name
4. Go to the "Bot" tab from the left menu
5. Click "Add Bot"
6. Click "Reset Token" to get your token and paste it into `config.json`
7. Copy the "APPLICATION ID" and paste it as `clientId`

### Bot Intents
Discord Developer Portal > Bot > Privileged Gateway Intents:
- ✅ SERVER MEMBERS INTENT
- ✅ MESSAGE CONTENT INTENT

### Bot Permissions
Grant the following permissions when adding the bot to your server:
- `Send Messages`
- `Embed Links`
- `Add Reactions`
- `Use External Emojis`
- `Read Message History`
- `Manage Messages`
- `Use Slash Commands`

### Generating Invite Link
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=277025770560&scope=bot%20applications.commands
```

---

## 📝 Command List

### 🎉 Giveaway Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/giveaway start` | Start a new giveaway | Manage Server |
| `/giveaway end` | End a giveaway | Manage Server |
| `/giveaway reroll` | Select a new winner | Manage Server |
| `/giveaway delete` | Delete a giveaway | Manage Server |
| `/giveaway list` | List active giveaways | Everyone |
| `/giveaway info` | Giveaway details | Everyone |
| `/giveaway stats` | Show statistics | Everyone |
| `/giveaway history` | Giveaway history | Everyone |

### 🚫 Blacklist Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/gblacklist add` | Block a user | Manage Server |
| `/gblacklist remove` | Unblock a user | Manage Server |
| `/gblacklist list` | Blacklist | Manage Server |

---

## 🎯 Usage Examples

### Simple Giveaway
```
/giveaway start duration:1d prize:Discord Nitro
```

### Multi-Winner Giveaway
```
/giveaway start duration:12h prize:Steam Gift Card winners:3
```

### Conditional Giveaway
```
/giveaway start duration:2d prize:VIP Role winners:1 required_role:@Member account_age:30 server_age:7
```

### Bonus Entry Giveaway
```
/giveaway start duration:1w prize:iPhone 15 bonus_role:@Booster bonus_amount:5
```

### Giveaway with Image
```
/giveaway start duration:3d prize:Gaming Mouse image:https://example.com/image.png
```

---

## ⏱️ Time Formats

| Format | Description | Example |
|--------|-------------|---------|
| `s`, `sec`, `seconds` | Seconds | `30s`, `30sec` |
| `m`, `min`, `minute` | Minutes | `30m`, `30min` |
| `h`, `hour` | Hours | `2h` |
| `d`, `day` | Days | `1d` |
| `w`, `week` | Weeks | `1w` |

### Combinations
- `1d 12h` = 1 day 12 hours
- `2d 6h 30m` = 2 days 6 hours 30 minutes
- `1w 3d` = 1 week 3 days

---

## 📁 File Structure

```
giveaway-bot/
├── index.js              # Main bot file
├── config.json           # Bot configuration
├── package.json          # NPM dependencies
├── deploy-commands.js    # Slash command registration
├── README.md             # Documentation
├── error.log             # Error log (auto-generated)
├── commands/             # Command files
│   ├── giveaway/         # Giveaway subcommands
│   ├── blacklist/        # Blacklist subcommands
│   ├── premium/          # Premium subcommands
│   ├── appeal.js         # Blacklist appeal command
│   ├── report.js         # Bug report command
│   ├── update.js         # Auto-update from GitHub
│   └── ...               # Other root commands
├── utils/                # Utility modules
│   ├── antiCrash.js      # Anti-Crash System v2.1.0
│   ├── GiveawayManager.js # Core giveaway logic
│   ├── componentsV2.js   # UI components & embeds
│   ├── languageManager.js # Multi-language system
│   ├── constants.js      # Colors & emojis
│   └── ...               # Other utilities
├── languages/            # Language files (15 languages)
└── database/             # Database folder (auto-generated)
    ├── giveaways.json    # Active giveaways
    ├── blacklist.json    # Blacklist
    ├── history.json      # Giveaway history
    └── stats.json        # Statistics
```

---

## 🎨 Embed Customization

### Color Codes
```javascript
const Colors = {
    PRIMARY: 0x5865F2,      // Discord Blurple
    SUCCESS: 0x57F287,      // Green
    WARNING: 0xFEE75C,      // Yellow
    ERROR: 0xED4245,        // Red
    PREMIUM: 0xF47FFF,      // Pink/Purple
    GOLD: 0xFFD700,         // Gold
    GIVEAWAY: 0xFF6B6B,     // Giveaway Red
};
```

### Changing Emojis
You can use your own emojis by editing the `emojis` section in the `config.json` file.

---

## 🔧 Troubleshooting

### Bot does not come online
1. Make sure the Token is correct.
2. Check if the bot is active in the "Bot" tab of the Discord Developer Portal.
3. Check if Intents are enabled (Privileged Gateway Intents).

### Slash commands not showing
1. Run `npm run deploy`.
2. Kick the bot from the server and add it again.
3. Restart Discord.

### Giveaway message not updating
1. Check if the bot has "Manage Messages" permission.
2. Check channel permissions.

### Database error
1. Check if the `database` folder is writable.
2. Check if JSON files are not corrupted.

---

## 📞 Support

- **Discord:** [Giveaway+ Support Server](https://discord.gg/qaNsZcBw8d)
- **Sponsored:** [Hostimux.com](https://hostimux.com)

---

## 📄 License

This project is licensed under the GNU General Public License v3.0.

---

## 📊 Version History

### v2.1.0 (Feb 2026) — Latest
- 🛡️ **Anti-Crash System v2.1.0** — Memory monitoring, rapid crash detection, auto-restart
- 🔄 **Auto-Update** — `/update` command to pull from GitHub and restart
- 📩 **Blacklist Appeal** — `/appeal` command with webhook integration
- 🌍 **15 Languages** — Full multi-language support with fallback system
- 🐛 **Bug Report** — `/report` command to report issues via webhook
- 📋 **Webhook System** — Error, appeal, and report webhooks
- 🔧 **English Logs** — All console outputs standardized to English
- ✅ **Undefined Fixes** — Fixed all undefined errors in translations and constants

### v2.0.0 (2026)
- ✨ Discord.js v14 support
- ✨ Slash commands
- ✨ Button entry
- ✨ Bonus entry system
- ✨ Advanced requirement system
- ✨ Statistics and history system
- ✨ Blacklist system
- ✨ Premium embed designs

---

**Made with ❤️ by Anarvion**
