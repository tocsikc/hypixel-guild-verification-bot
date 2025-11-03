const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user.'),

    async execute(interaction) {
        await interaction.reply('Kick Command');
    }
};