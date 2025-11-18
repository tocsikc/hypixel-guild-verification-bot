const { Events } = require('discord.js');
const { autoUpdater } = require('../utils/autoUpdater.js')

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🟩 Discord Ready: ${client.user.tag} is online.`);
        autoUpdater(client);
    },
};
