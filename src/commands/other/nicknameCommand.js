const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Set a nickname.'),

    async execute(interaction) {
        await interaction.reply('Nickname Command (Coming soon)');
    }
};