const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user.'),

    async execute(interaction) {
        await interaction.reply('Unmute Command');
    }
};