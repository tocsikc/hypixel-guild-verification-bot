const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update your roles!'),

    async execute(interaction) {
        await interaction.reply('Update Command');
    }
};