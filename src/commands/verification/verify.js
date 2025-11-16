const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { sleep } = require('../../contracts/helperFunctions.js');
const { addUser, inDB } = require('../../services/getLinked.js');
const { getUuidByUsername } = require('../../services/mojang.js');
const { getHypixelPlayer } = require('../../services/hypixel.js');

const updateCommand = require("./update.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Link your account to the guild!')
        .addStringOption((option) => option.setName('username').setDescription('Your Minecraft username.').setRequired(true)),

    async execute(interaction, extra = {silent: false, discordId: null}) {
        try {
            await interaction.deferReply({flags: MessageFlags.Ephemeral});
            await interaction.editReply({
                content: `\`🔗\` Attempting to link user...`
            });

            const discordId = extra.discordId ?? interaction.user.id;
            const discordMember = await interaction.guild.members.fetch(discordId);
            
            const username = interaction.options.getString("username");
            const uuid = await getUuidByUsername(username);
            const player = await getHypixelPlayer(uuid);
            const nickname = player.displayname;

            if (await inDB(discordId, uuid) === 'discord') {
                return interaction.editReply({
                    content: '\`❌\` You are already linked. \n-# Use /unverify to unlink account.'
                });
            } else if (await inDB(discordId, uuid) === 'minecraft') {
                return interaction.editReply({
                    content: `\`❌\` \`${nickname}\` is linked to another Discord account.`
                });
            }

            const linkedDiscord = player?.socialMedia?.links?.DISCORD?.toLowerCase()
            if (!linkedDiscord) {
                return interaction.editReply({
                    content: `\`❌\` \`${nickname}\` does not have a Discord linked.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (linkedDiscord !== discordMember.user.username) {
                return interaction.editReply({
                    content: `\`❌\` \`${nickname}\` has been linked to a different Discord account (\`${linkedDiscord}\`).`
                });
            }

            await addUser(discordId, uuid);

            const embed = new EmbedBuilder()
                .setColor("4BB543")
                .setAuthor({ name: "✅ Account linked" })
                .setDescription(`User <@${discordId}> (\`${nickname}\`) has been verified.`)

            await updateCommand.execute(interaction, {silent: true, discordId: discordId, uuid: uuid});

            await sleep(1000);

            await interaction.followUp({ embeds: [embed] });
            

        } catch (error) {
            console.log(error);

            const errorEmbed = new EmbedBuilder()
                .setColor(15548997)
                .setAuthor({ name: "❌ An Error has occurred" })
                .setDescription(`\`\`\`${error}\`\`\``)

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }   
};