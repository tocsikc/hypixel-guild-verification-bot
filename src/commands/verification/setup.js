const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup verification message.'),
    requiredRole: 'devRole',

    async execute(interaction) {
        await interaction.reply('Setup Command');
    }
};