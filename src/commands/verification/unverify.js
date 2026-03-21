const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { sleep } = require('../../contracts/helperFunctions.js');
const { removeUser, inDB } = require('../../services/getLinked.js');
const { errorLogger } = require('../../utils/logger.js');

const updateCommand = require("./update.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unverify')
        .setDescription('Unlink your account from the guild.'),

    async execute(interaction, extra = {silent: false, discordId: null}) {
        try {
            await interaction.deferReply();
            await interaction.editReply({ content: `\`⛓️‍💥\` Attempting to unlink user...` });

            const discordId = extra.discordId ?? interaction.user.id;
            const discordMember = await interaction.guild.members.fetch(discordId);

            if (inDB(discordId) === false) {
                result = `\`❌\` ${discordMember.user} is not linked!\n-# Use /verify to link account.`
                if (!extra.silent) {
                    return interaction.followUp({
                        content: result
                    });
                }
                return [result];
            }
            
            await removeUser(discordId);

            await updateCommand.execute(interaction, {silent: true, discordId: discordId, uuid: null});

            const embed = new EmbedBuilder()
                .setColor("4BB543")
                .setAuthor({ name: "✅ Account unlinked" })
                .setDescription(`User <@${discordId}> has been unverified.`)

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await errorLogger(interaction.client, error);
                        
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997)
                .setAuthor({ name: "❌ An Error has occurred" })
                .setDescription(`\`\`\`${error}\`\`\``)

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};