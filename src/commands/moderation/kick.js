const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user.'),
    requiredRole: 'moderatorRole',

    async execute(interaction) {
        await interaction.reply('Kick Command');
    }
};