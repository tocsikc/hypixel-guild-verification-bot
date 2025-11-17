const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { inDB, getUUID } = require('../../services/getLinked.js');
const { getUsername } = require('../../services/mojang.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('linked')
        .setDescription('Check who is linked to another Discord or Minecraft account.')
        .addUserOption((option) => option.setName('discord').setDescription('The Discord account to lookup.').setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();
        await interaction.editReply({
                content: `\`📌\` Finding user...`
        });

        const discord = await interaction.options.getUser('discord') || interaction.user; 

        if (await inDB(discord.id) === false) {
            const embed = new EmbedBuilder()
                .setColor("4BB543")
                .setAuthor({ name: "❌ Not found" })
                .setDescription(`<@${discord.id}> is not linked!`)
                .setFooter({text: 'Use /verify to link account.'})
            return interaction.editReply({
                embeds: [embed]
            });
        }

        const uuid = await getUUID(discord.id);
        const username = await getUsername(uuid)

        const successEmbed = new EmbedBuilder()
            .setColor("4BB543")
            .setAuthor({ name: "✅ User Found" })
            .setDescription(`<@${discord.id}> is linked to \`${username}\``)

        return interaction.editReply({ embeds: [successEmbed] });
    }
};