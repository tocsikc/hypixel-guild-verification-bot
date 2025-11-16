const { EmbedBuilder } = require('discord.js')

const { getUUID } = require('../services/getLinked.js');
const { getHeadPNG } = require('../services/mojang.js');

const config = require("../../config.json");

async function getLogChannel(client) {
    try {
        const guild = await client.guilds.fetch(config.bot.guildId).catch(() => null);
        if (!guild) {
            console.warn("[LOGGER] Could not find guild with ID", config.bot.guildId);
            return null;
        }

        const channel = await guild.channels.fetch(config.logsChannel).catch(() => null);
        if (!channel) {
            console.warn("[LOGGER] Could not find log channel with ID", config.logsChannel);
            return null;
        }

        return channel;
    } catch (error) {
        console.error("[LOGGER] Error getting log channel:", error);
        return null;
    }
}
async function roleUpdateLogger(client, discord, roles) {
    try {
        const channel = await getLogChannel(client);
        if (!channel) return;

        const uuid = await getUUID(discord.id).catch(() => null);
        const headPNG = await getHeadPNG(uuid) || await getHeadPNG('');

        const roleEmbed = new EmbedBuilder()
                .setAuthor({ name: '🚨 Logger → 🛠️ Roles Changes'})
                .setDescription(`**Role Updates for <@${discord.id}>:**${roles}`)
                .setColor('#0f8ec9')
                .setThumbnail(headPNG)
                .setFooter({text: `Guild Verification Bot • by @tocsikc`})
                .setTimestamp();

        await channel.send({ embeds: [roleEmbed] });
    } catch (error) {
        console.error("[LOGGER] Logging error in roleUpdateLogger:", error);
    }
}

async function errorLogger(client, errorMessage) {
    try {
        const channel = await getLogChannel(client);
        if (!channel) return;
        
        const errorEmbed = new EmbedBuilder()
                .setAuthor({ name: '🚨 Logger → ❌ An Error Occurred'})
                .setDescription(`\`\`\`${errorMessage}\`\`\``)
                .setColor('#e41313')
                .setFooter({text: `Guild Verification Bot • by @tocsikc`})
                .setTimestamp();

        await channel.send({ embeds: [errorEmbed] });
    } catch (error) {
        console.error("[LOGGER] Logging error in errorLogger:", error);
    }
}


module.exports = { roleUpdateLogger, errorLogger }