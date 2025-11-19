const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { sleep } = require('../../contracts/helperFunctions.js');
const { addUser, inDB } = require('../../services/getLinked.js');
const { getUuidByUsername } = require('../../services/mojang.js');
const { getHypixelPlayer } = require('../../services/hypixel.js');
const { errorLogger } = require('../../utils/logger.js');
const { updateRoles } = require("./update.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Link your account to the guild!')
        .addStringOption((option) => option.setName('username').setDescription('Your Minecraft username.').setRequired(true)),

    async execute(interaction, extra = {silent: false, discordId: null, username: undefined}) {
        try {
            if (!extra.silent) {
                await interaction.deferReply();
                await interaction.editReply({
                    content: `\`🔗\` Attempting to link user...`
                });
            }
            
            let result = ''
            const discordId = extra.discordId ?? interaction.user.id;
            const discordMember = await interaction.guild.members.fetch(discordId);
            
            const username = extra.username ? extra.username : interaction.options.getString("username"); 
            const uuid = await getUuidByUsername(username);
            const player = await getHypixelPlayer(uuid);
            const nickname = player.displayname;

            if (await inDB(discordId, uuid) === 'discord') {
                result = '\`❌\` You are already linked. \n-# Use /unverify to unlink account.'
                if (!extra.silent) {
                    await interaction.editReply({
                        content: `\`❌\` Something went wrong...`
                    });
                    return interaction.followUp({
                        content: result,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    return [result];
                }
            } else if (await inDB(discordId, uuid) === 'minecraft') {
                result = `\`❌\` \`${nickname}\` is linked to another Discord account.`
                if (!extra.silent) {
                    await interaction.editReply({
                        content: `\`❌\` Something went wrong...`
                    });
                    return interaction.followUp({
                        content: result,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    return [result];
                }
            }

            const linkedDiscord = player?.socialMedia?.links?.DISCORD?.toLowerCase()
            
            if (!linkedDiscord) {
                result = `\`❌\` \`${nickname}\` does not have a Discord linked.`
                if (!extra.silent) {
                    await interaction.editReply({
                        content: `\`❌\` Something went wrong...`
                    });
                    return interaction.followUp({
                        content: result,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    return [result];
                }
            }

            if (linkedDiscord !== discordMember.user.username) {
                result = `\`❌\` \`${nickname}\` has been linked to a different Discord account (\`${linkedDiscord}\`).`
                if (!extra.silent) {
                    await interaction.editReply({
                        content: `\`❌\` Something went wrong...`
                    });
                    return interaction.followUp({
                        content: result,
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    return [result];
                }
            }

            await addUser(discordId, uuid);

            const embed = new EmbedBuilder()
                .setColor("4BB543")
                .setAuthor({ name: "✅ Account linked" })
                .setDescription(`User <@${discordId}> (\`${nickname}\`) has been verified.`)

            await updateRoles(interaction.client, discordId, uuid);

            if (!extra.silent) {
                await interaction.editReply({ embeds: [embed] });
            } else {
                return [embed, {embed: true}];
            }

        } catch (error) {
            await errorLogger(interaction.client, error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(15548997)
                .setAuthor({ name: "❌ An Error has occurred" })
                .setDescription(`\`\`\`${error}\`\`\``)

            if (!extra.silent) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                return [errorEmbed, {embed: true}];
            }
        }
    }   
};