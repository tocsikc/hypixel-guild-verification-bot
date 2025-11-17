const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

const { removeRoles, addRoles, sleep } = require('../../contracts/helperFunctions.js')
const { getUUID, getDiscord, inDB } = require('../../services/getLinked.js');
const { getUsername } = require('../../services/mojang.js');
const { getGuildByName } = require('../../services/hypixel.js');
const { errorLogger } = require('../../utils/logger.js');

async function updateRoles(interaction, discordId, uuid) {
    const ranksArray = config.guild.ranks;
    const ranks = Object.fromEntries(ranksArray.map(r => [r.name, r.role]));
    const rankRoles = Object.values(ranks);

    const guildTimeArray = config.guild.timeRoles;
    const guildTime = [...guildTimeArray].sort((a, b) => a.time - b.time);
    const timeRoleIds = guildTime.map(t => t.role);

    let result;
    let addedRoles = [];
    let removedRoles = [];


    const discordMember = await interaction.guild.members.fetch(discordId).catch(() => null);
    if (!discordMember) {
        throw Error("User not in Discord.");
    }

    if (!uuid) {
        removedRoles.push(config.guild.guestRole, config.guild.guildRole, config.guild.verifiedRole, ...rankRoles, ...timeRoleIds);
        addedRoles.push(config.guild.unverifiedRole);

        await removeRoles(discordMember, removedRoles);
        await addRoles(discordMember, addedRoles);

        result = `\`🟩\` <@&${config.guild.unverifiedRole}>`;
        return result;
    }


    const guildData = await getGuildByName(config.guild.name);

    if (!guildData || !guildData?.members) throw Error("Guild does not exist. (Please contact an administrator)");

    const strippedUUID = uuid.replaceAll('-', '');
    const guildMembers = guildData.members;
    const guildMember = guildMembers.find(m => m.uuid === strippedUUID);

    if (!guildMember) {
        removedRoles.push(config.guild.guildRole, ...rankRoles, ...timeRoleIds);
        addedRoles.push(config.guild.guestRole);
        result = `\`🟥\` <@&${config.guild.guildRole}>`;
        
    } else if (guildMember) {
        removedRoles.push(config.guild.guestRole);
        addedRoles.push(config.guild.guildRole);
        let guildRankRole;

        for (const [rankName, roleId] of Object.entries(ranks)) {
            if (rankName.toLowerCase() === guildMember.rank.toLowerCase()) {
                addedRoles.push(roleId);
                guildRankRole = roleId;
            } else {
                removedRoles.push(roleId);
            }
        }

        const joinTime = guildMember.joined;
        const now = Date.now();
        const diff = now - joinTime;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        let timeRole = null;

        for (const entry of guildTime) {
            if (days >= entry.time) {
                timeRole = entry.role;
            } else {
                break;
            }
        }

        for (const roleId of timeRoleIds) {
            if (roleId === timeRole) {
                if (!addedRoles.includes(roleId)) {
                    addedRoles.push(roleId);
                }
            } else {
                removedRoles.push(roleId);
            }
        }
        const joinTimeSeconds = Math.floor(joinTime / 1000)
        removedRoles = removedRoles.filter(r => r !== guildRankRole);
        result = `\`🟩\` <@&${config.guild.guildRole}>${timeRole ? `\n\`🟩\` <@&${timeRole}> (<t:${joinTimeSeconds}:R>)` : ''}\nGuild Rank: \`${guildMember.rank}\``;
    }

    if (config.other.nicknames) {
        const username = await getUsername(uuid);
        await discordMember.setNickname(username);
    }

    removedRoles.push(config.guild.unverifiedRole);
    addedRoles.push(config.guild.verifiedRole);

    await removeRoles(discordMember, removedRoles);
    await addRoles(discordMember, addedRoles);
    return result;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update your roles!'),
    updateRoles,
    
    async execute(interaction, extra = {silent: false, discordId: null, uuid: undefined}) {
        try {
            if (!extra.silent) {
                await interaction.deferReply();
                await interaction.editReply({
                    content: `\`🛠️\` Updating roles...`
                });
            }       

            const discordId = extra.discordId ?? interaction.user.id;
            const discordMember = await interaction.guild.members.fetch(discordId).catch(() => null);

            if (discordMember.user.bot) {
                return interaction.editReply({
                    content: `🤖 Skipped: \`Bot\``
                });
            }

            const uuid = (extra.uuid !== undefined)
                ? extra.uuid
                : await getUUID(discordId);

            const resultText = await updateRoles(interaction, discordId, uuid)

            if (!extra.silent) {
                const successEmbed = new EmbedBuilder()
                .setAuthor({ name: ' ✅ Roles Updated'})
                .setDescription(`Updated roles for <@${discordId}> (\`${await getUsername(uuid)}\`)\n${resultText}`)
                .setColor('#13e436')

                await interaction.editReply({ embeds: [successEmbed]});
            }

        } catch (error) {
            await errorLogger(interaction.client, error);
            if (!extra.silent) {
                const errorEmbed = new EmbedBuilder()
                .setAuthor({ name: '❌ An Error Occurred' })
                .setDescription(`\`\`\`${error}\`\`\``)
                .setColor('#e41313');
                
                await interaction.editReply({
                    content: `\`❌\` Something went wrong...`
                });

                await interaction.editReply({ embeds: [errorEmbed]});
            }
        }
    }
};