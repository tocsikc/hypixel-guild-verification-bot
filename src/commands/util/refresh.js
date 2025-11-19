const { SlashCommandBuilder } = require('discord.js');
const { requiredRole } = require('../verification/setup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Restarts the bot.'),
        requiredRole: 'devRole',

    async execute(interaction) {
        await interaction.reply('Restarting!');
        process.exit();
    }
};