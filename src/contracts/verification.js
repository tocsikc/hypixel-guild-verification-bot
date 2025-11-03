const fs = require('node:fs');
const path = require('node:path');
const config = require('../../config.json');

const guildName = config.guild.name;

const { getUuidByUsername, getHypixelPlayer, getGuildByPlayer, getGuildByName } = require('../services/getData.js');

async function checkUser(client, discordId, username) { // Check if user Discord links to Minecraft in game (Hypixel Socials)
    const discord = client.users.fetch(discordId);
    const player = getHypixelPlayer(getUuidByUsername(username));
}

async function inGuild(username) { // Check if user is in the Hypixel Guild
    const guild = getGuildByPlayer(getUuidByUsername(username));
    return guild && guild.name?.toLowerCase() === guildName?.toLowerCase();
}

async function updateUser(discordId, username) { // Update the user's roles in Discord

}

module.exports = { checkUser, inGuild, updateUser }