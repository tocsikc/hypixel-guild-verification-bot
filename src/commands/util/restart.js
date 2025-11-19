const { SlashCommandBuilder } = require('discord.js');
const { requiredRole } = require('../verification/setup');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Restarts the bot!'),
        requiredRole: 'devRole',

    async execute(interaction) {
        await interaction.reply('Restarting!');
        process.exit();
    }
};