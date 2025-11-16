const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infraction')
        .setDescription('Check or modify infractions.'),
    requiredRole: 'moderatorRole',

    async execute(interaction) {
        await interaction.reply('Infraction Command');
    }
};