const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('linked')
        .setDescription('Check who is linked to another Discord or Minecraft account.')
        .addUserOption((option) => option.setName('discord').setDescription('The Discord account to lookup.').setRequired(false))
        .addStringOption((option) => option.setName('username').setDescription('The Minecraft username to lookup.').setRequired(false)),

    async execute(interaction) {
        await interaction.reply('Linked Command');
    }
};