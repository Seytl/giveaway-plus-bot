# 🎉 Giveaway + Premium Giveaway Bot By Anarvion

Professional and comprehensive giveaway bot developed with Discord.js v14.

![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

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

### 🎨 Visual Features
- ✅ **Premium Embeds** - Professional looking messages
- ✅ **Custom Images** - Add images to giveaways
- ✅ **Emoji Support** - Rich emoji usage
- ✅ **Live Updates** - Real-time participant count updates

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
└── database/             # Database folder (automatically created)
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
- **Sponsored:** [Hostimux.com] (https://hostimux.com)

---

## 📄 License

This project is licensed under the MIT License.

---

## 📊 Version History

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
