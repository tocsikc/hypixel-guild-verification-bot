const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user.'),
    requiredRole: 'devRole',

    async execute(interaction) {
        await interaction.reply('Ban Command');
    }
};