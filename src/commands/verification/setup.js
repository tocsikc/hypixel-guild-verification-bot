const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, MessageFlags, Embed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup verification message.')
        .addChannelOption(option => option.setName('channel').setDescription('Channel the message will go into.').setRequired(true)),
    requiredRole: 'devRole',

    async execute(interaction) {
        return interaction.reply('no')
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('channel');

        const verifyButton = new ButtonBuilder()
			.setCustomId('link_button')
			.setLabel('✅ Verify')
			.setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder()
            .addComponents(verifyButton);

        const verifyEmbed = new EmbedBuilder()
            .setColor('5865F2')
            .setDescription(`### 🔐 Verification`)
    }
};