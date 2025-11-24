const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),

    async execute(interaction) {
        await interaction.reply(`Pong! Responded in ${client.ws.ping}ms `);
    }
};