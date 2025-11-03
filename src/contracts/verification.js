const fs = require('node:fs');
const path = require('node:path');
const config = require('../../config.json')

const { getUuidByUsername, getHypixelPlayer, getGuildByPlayer, getGuildByName } = require('../services/getData.js')

async function checkUser(client, discordId, username) { // Check if user Discord links to Minecraft in game (Hypixel Socials)
    const discord = client.users.fetch(discordId)
}

async function inGuild(username) { // Check if user is in the Hypixel Guild

}

async function updateUser(discordId, username) { // Update the user's roles in Discord

}

// async function func(discordId, username) {

// }

module.exports = { checkUser, updateUser }