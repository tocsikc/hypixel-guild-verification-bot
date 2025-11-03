const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user.'),

    async execute(interaction) {
        await interaction.reply('Unban Command');
    }
};