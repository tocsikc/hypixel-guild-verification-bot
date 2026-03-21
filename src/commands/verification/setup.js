const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup verification message.')
        .addChannelOption(option => option.setName('channel').setDescription('Channel the message will go into.').setRequired(true)),
    requiredRole: 'devRole',

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('channel');

        const verifyButton = new ButtonBuilder()
			.setCustomId('verify_button')
			.setLabel('✅ Verify')
			.setStyle(ButtonStyle.Success);

        const updateButton = new ButtonBuilder()
            .setCustomId('update_button')
			.setLabel('🛠️ Update')
			.setStyle(ButtonStyle.Danger);

        const unverifyButton = new ButtonBuilder()
            .setCustomId('unverify_button')
			.setLabel('❌ Unverify')
			.setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder()
            .addComponents(verifyButton, updateButton, unverifyButton);

        const verifyEmbed = new EmbedBuilder()
            .setColor('5865F2')
            .setDescription(`### 🔐 Verification\nWelcome to **${config.guild.name}**!`)
            .addFields({
                name: 'Verification Process',
                value: '- Click The `Verify` button.\n- Enter your **Minecraft username**.\n- Check under this embed to see if you were verified.'
            })
            .addFields({
                name: 'IMPORTANT!',
                value: '- We will **NOT** ask for your **Minecraft email**.\n- You must have your Discord linked on Hypixel socials. Check Below for help!\n- If you are already linked, you can update or unverify.'
            })
            .setImage('https://cdn.discordapp.com/attachments/1438936349540487168/1440411696639512586/8mb.video-N9F-goe91F0m.gif?ex=691e0f6e&is=691cbdee&hm=244f90322c580970da6b6d8f235378e80800248b9339ea7041165ed08b139725&')
            
        await channel.send({
            embeds: [verifyEmbed],
            components: [actionRow]
        });

        await interaction.editReply({
            content: `\`➡️\` Sending message... (${channel})`,
            flags: MessageFlags.Ephemeral
        });
    }
};