const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const { token } = config.bot;

const commandHandler = require('./src/commandHandler.js');
const eventHandler = require('./src/eventHandler.js');
const deployCommands = require('./src/utils/deployCommands.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
    ] 
});

const filePath = path.join(__dirname, 'config.json');

if (!fs.existsSync(filePath)) {
    console.warn('[WARNING] "config.json" does not exist! Please create a config file.');
    process.exit(0)
}

deployCommands // Registers new commands when created.
commandHandler(client);
eventHandler(client);

client.login(token);