const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('force')
        .setDescription('Forcefully modify verification of a user.'),

    async execute(interaction) {
        await interaction.reply('Force Command');
    }
};