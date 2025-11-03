const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unverify')
        .setDescription('Unlink your account from the guild.'),

    async execute(interaction) {
        await interaction.reply('Unverify Command');
    }
};