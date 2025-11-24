const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const config = require('../../../config.json');

const { addNick, removeNick, getNickname } = require('../../services/getNicknames');
const { getUUID } = require('../../services/getLinked');
const { updateRoles } = require("../verification/update.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Set a nickname.')
        .addStringOption((option) => option.setName('nickname').setDescription('The nickname to set.').setRequired(false).setMinLength(3).setMaxLength(20)),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!config.other.nicknames) {
            return interaction.editReply({
                content:`\`❌\` Nicknames are not enabled.`,
                flags: MessageFlags.Ephemeral
            });
        }
        const nickRoles = config.other.nickPermsRoles;
        const nickBlacklistRole = config.other.nickBlacklistRole;
        const verifiedRole = config.guild.verifiedRole;
        
        if (!interaction.member.roles.cache.has(verifiedRole)) {
            return interaction.editReply({
                content:`\`❌\` You must be verified to use this role! (<@&${verifiedRole}> required)`,
                flags: MessageFlags.Ephemeral
            });
        }

        if (nickRoles.length > 0) {
            if (!nickRoles.some(roleId => interaction.member.roles.cache.has(roleId)) ) {
                const nickRolesFormatted = Array.isArray(nickRoles) ? nickRoles.map(role => `<@&${role}>`).join('\n'): nickRoles ;
                return interaction.editReply({
                    content:`\`❌\` You don\'t have permission to do that. (${nickRolesFormatted} required)`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        if (!nickBlacklistRole || nickBlacklistRole !== "") {
            if (interaction.member.roles.cache.has(nickBlacklistRole)) {
                return interaction.editReply({
                    content:`\`❌\` You are not allowed to use this command. (Nickname Blacklisted)`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
        const nickname = interaction.options.getString("nickname");
        if (!nickname) {
            await removeNick(interaction.user.id);
        } else {
            await addNick(interaction.user.id, nickname);
        }

        const uuid = await getUUID(interaction.user.id);
        await updateRoles(interaction.client, interaction.user.id, uuid);
        return interaction.editReply({
            content:`\`✅\` Successfully updated your nickname to \`${nickname}\``,
            flags: MessageFlags.Ephemeral
        });
    }   
};