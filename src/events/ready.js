const { Events, ActivityType  } = require('discord.js');
const { autoUpdater } = require('../utils/autoUpdater.js')

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🟩 Discord Ready: ${client.user.tag} is online.`);
        client.user.setActivity('/verify | Guild Verification Bot by @tocsikc', { type: ActivityType.Watching });
        autoUpdater(client);
    },
};
