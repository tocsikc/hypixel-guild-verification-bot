const cron = require('node-cron');
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');
const { sleep } = require('../contracts/helperFunctions.js');
const { getUUID, loadDB } = require('../services/getLinked.js');
const { getLogChannel, errorLogger, autoUpdateLogger } = require('./logger.js');
const { updateRoles } = require('../commands/verification/update.js');

async function updateMembers(client) {
    try {
        const db = await loadDB();
        const membersLength = Object.keys(db).length;
        if (membersLength < 1) return;
        let failedUsers = 0;
        let updatedUsers = 0;
        
        await autoUpdateLogger(client, membersLength);

        const guild = await client.guilds.fetch(config.bot.guildId).catch(() => null);
        if (!guild) {
            console.warn("[WARNING] Could not find guild with ID", config.bot.guildId);
            return null;
        }

        for (const discordId of Object.keys(db)) {
            await sleep(150);
            
            const user = await guild.members.fetch(discordId).catch(() => null);
            const uuid = await getUUID(discordId);
            if (!user || !uuid) {
                failedUsers++;
                continue;
            }
            
            await updateRoles(client, discordId, uuid);
            updatedUsers++;
        }

        return autoUpdateLogger(client, membersLength, updatedUsers, failedUsers);
    } catch (error) {
        console.log(error);
        await errorLogger(client, error);
    }
}

async function autoUpdater(client) {
    if (!config.other.autoUpdater) return;
    const interval = (!config.other.autoUpdaterInterval || config.other.autoUpdaterInterval <= 1) ? 12 : config.other.autoUpdaterInterval;
    console.log(`🟩 AutoUpdater Ready: Updating every ${interval} hour${interval === 1 ? "" : "s"}.`)
    cron.schedule(`0 */${interval} * * *`, async () => {
        try {
            await updateMembers(client);
        } catch (error) {
            console.log(error);
            await errorLogger(client, error);
        }
    });
}
    
module.exports = { autoUpdater }