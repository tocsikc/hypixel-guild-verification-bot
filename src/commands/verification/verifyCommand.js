const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Link your account to the guild!')
        .addStringOption((option) => option.setName('username').setDescription('Your Minecraft username.').setRequired(true)),

    async execute(interaction) {
        await interaction.reply('Verify Command');
    }
};