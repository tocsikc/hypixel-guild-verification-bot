const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Message } = require('discord.js');

const config = require('../../../config.json');
const { loadDB } = require('../../services/getLinked');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Info about the bot.'),

    async execute(interaction) {
        await interaction.deferReply();

        const guild = await interaction.client.guilds.fetch(config.bot.guildId);
        await guild.members.fetch();
        const members = guild.memberCount;

        const db = await loadDB();
        const membersLinked = Object.keys(db).length ?? 0;

        const ranks = config.guild.ranks;
        if (ranks.length >= 0) {
            ranksFormatted = ranks.map(r => `${r.name}: <@&${r.role}>`).join('\n');
        } else {
            ranksFormatted = 'Not set.';
        }

        const timeRoles = config.guild.timeRoles;
        if (timeRoles.length >= 0) {
            timeRolesFormatted = timeRoles.map(t => `${t.time} Days: <@&${t.role}>`).join('\n');
        } else {
            timeRolesFormatted = 'Not set.';
        }
        

        const embed = new EmbedBuilder()
            .setColor("3370e0")
            .setAuthor({ name: "📝 Server info" })
            .addFields(
                {
                    name: 'Discord Information',
                    value: `Members Linked: \`${membersLinked}\`/\`${members}\`\nLogging Channel: ${config.other.logsChannel ? `<#${config.other.logsChannel}>` : '\`None\` '}\nDeveloper Role: ${
                        config.permissions.devRole ? `<@&${config.permissions.devRole}>` : '\`None\`'}\nModerator Role: ${
                        config.permissions.moderatorRole ? `<@&${config.permissions.moderatorRole}>` : '\`None\`'}\nDeveloper Mode: \`${
                        config.permissions.developerMode ? '\`enabled\`' : '\`disabled\`'}\`\nNicknames: \`${
                        config.other.nicknames ? '\`enabled\`' : '\`disabled\`'}\`\n`,
                    inline: true
                },
                {
                    name: 'Guild Information',
                    value: `Guild Name: \`${config.guild.name ? config.guild.name : '\`None\`'}\`\nVerified Role: ${
                        config.guild.verifiedRole ? `<@&${config.guild.verifiedRole}>` : '\`None\`'}\nUnverified Role: ${
                        config.guild.unverifiedRole ? `<@&${config.guild.unverifiedRole}>` : '\`None\`'}\nGuild Role: ${
                        config.guild.guildRole ? `<@&${config.guild.guildRole}>` : '\`None\`'}\nGuest Role: ${config.guild.guestRole ? `<@&${config.guild.guestRole}>` : '\`None\`'}`,
                    inline: true
                },
                { name: ' ', value: ' '},
                {
                    name: 'Guild Ranks',
                    value: ranksFormatted,
                    inline: true
                },
                {
                    name: 'Guild Time Roles',
                    value: timeRolesFormatted,
                    inline: true
                },
            )
            .setFooter({ text: `Guild Verification Bot • by @tocsikc` })
            .setTimestamp()

            await interaction.editReply({ embeds: [embed] });
    }
};