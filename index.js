const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const commandHandler = require('./src/commandHandler.js');
const eventHandler = require('./src/eventHandler.js');
const deployCommands = require('./src/deployCommands.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

deployCommands
commandHandler(client);
eventHandler(client);
client.login(token);