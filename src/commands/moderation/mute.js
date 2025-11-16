const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user.'),
    requiredRole: 'moderatorRole',

    async execute(interaction) {
        await interaction.reply('Mute Command');
    }
};