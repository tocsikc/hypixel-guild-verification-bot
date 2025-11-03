const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user.'),

    async execute(interaction) {
        await interaction.reply('Warn Command');
    }
};