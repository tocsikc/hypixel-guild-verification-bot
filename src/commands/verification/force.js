const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Embed } = require('discord.js');

const { sleep } = require('../../contracts/helperFunctions.js');
const { addUser, inDB, getDiscord, getUUID, loadDB } = require('../../services/getLinked.js');
const { getUuidByUsername } = require('../../services/mojang.js');
const { errorLogger, nicknameLogger } = require('../../utils/logger.js');
const { getGuildByName } = require('../../services/hypixel.js');
const { addNick, removeNick } = require('../../services/getNicknames');

const config = require('../../../config.json');
const updateCommand = require("./update.js");
const unverifyCommand = require("./unverify.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('force')
        .setDescription('Forcefully modify a user\'s verification status.')
        .addSubcommand(subcommand => 
            subcommand
			    .setName('verify')
			    .setDescription('Links selected user.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account').setRequired(true))
                .addStringOption(option => option.setName('username').setDescription('Minecraft username').setRequired(true)),
        )
        .addSubcommand(subcommand => 
            subcommand
			    .setName('unverify')
			    .setDescription('Unlinks selected user.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account').setRequired(true)),
        )
        .addSubcommand(subcommand => 
            subcommand
			    .setName('update')
			    .setDescription('Update selected user\'s roles.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account')),
        )
        .addSubcommand(subcommand => 
            subcommand
			    .setName('nick')
			    .setDescription('Changes user\'s nick.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account').setRequired(true))
                .addStringOption(option => option.setName('nickname').setDescription('Nickname (Empty to reset)')),
        ),
    requiredRole: 'devRole',

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case "verify": {
                try {
                    await interaction.deferReply();
                    await interaction.editReply({
                        content: `\`🔗\` Attempting to link user...`
                    });

                    const discord = interaction.options.getUser("discord");
                    const discordId = discord.id;

                    const username = interaction.options.getString("username");
                    const uuid = await getUuidByUsername(username);

                    if (await inDB(discordId, uuid) === 'discord') {
                        return interaction.followUp({
                            content: '\`❌\` This account is already linked. \n-# Use /force unverify to unlink account.',
                            flags: MessageFlags.Ephemeral
                        });
                    } else if (await inDB(discordId, uuid) === 'minecraft') {
                        return interaction.followUp({
                            content: `\`❌\` \`${username}\` is linked to another Discord account.`,
                            flags: MessageFlags.Ephemeral
                        });
                    }

                    await addUser(discordId, uuid);

                    const embed = new EmbedBuilder()
                        .setColor("4BB543")
                        .setAuthor({ name: "✅ Account linked" })
                        .setDescription(`User <@${discordId}> (\`${username}\`) has been verified.`)

                    await updateCommand.execute(interaction, {silent: true, discordId: discordId, uuid: uuid});

                    return interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    await errorLogger(interaction.client, error);

                    const errorEmbed = new EmbedBuilder()
                        .setColor(15548997)
                        .setAuthor({ name: "❌ An Error has occurred" })
                        .setDescription(`\`\`\`${error}\`\`\``)

                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            }
            case "unverify": {
                try {
                    const discord = interaction.options.getUser('discord');

                    return unverifyCommand.execute(interaction, {discordId: discord.id});
                } catch (error) {
                    await errorLogger(interaction.client, error);

                    const errorEmbed = new EmbedBuilder()
                        .setColor(15548997)
                        .setAuthor({ name: "❌ An Error has occurred" })
                        .setDescription(`\`\`\`${error}\`\`\``)

                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            }
            case "update": {
                try {
                    const discord = interaction.options.getUser("discord") || null;
                    if (discord) {
                        const discordId = discord.id;

                        await updateCommand.execute(interaction, {discordId: discordId});
                    } else if (!discord) {
                        await interaction.deferReply();
                        const db = await loadDB();
                        const membersLength = Object.keys(db).length;
                        if (membersLength < 1) return interaction.editReply({ content: 'No members to update.', flags: MessageFlags.Ephemeral })
                        let failedUpdates = 0;
                        let updatedUsers = 0;
                        let completed = 0

                        const updateEmbed = new EmbedBuilder()
                            .setAuthor({name: '🛠️ Updating all users'})
                            .setDescription(`\`🟩\` Updated Users: \`${updatedUsers}\`\n\`🟥\` Failed Updates: \`${
                                failedUpdates}\`\n\`⚙️\` Users Updated: \`${completed}\`/\`${membersLength}\``)
                            .setFooter({ text: `Guild Verification Bot • by @tocsikc` })
                            .setTimestamp()

                        await interaction.editReply({ embeds: [updateEmbed] });
                        for (const discordId of Object.keys(db)) {
                            if (completed % 9 === 0) {
                                const updatingEmbed = new EmbedBuilder()
                                    .setAuthor({name: '🛠️ Updating all users'})
                                    .setDescription(`\`🟩\` Updated Users: \`${updatedUsers}\`\n\`🟥\` Failed Updates: \`${
                                        failedUpdates}\`\n\`⚙️\` Users Updated: \`${completed}\`/\`${membersLength}\``)
                                    .setFooter({ text: `Guild Verification Bot • by @tocsikc` })
                                    .setTimestamp()
                                await interaction.editReply({ embeds: [updatingEmbed] });
                            }
                            completed++;
                            await sleep(120);

                            const user = await interaction.guild.members.fetch(discordId).catch(() => null);
                            const uuid = await getUUID(discordId);
                            if (!user || !uuid) {
                                failedUpdates++;
                                continue;
                            }
                            
                            await updateCommand.execute(interaction, {silent: true, discordId: discordId, uuid: uuid});
                            updatedUsers++;
                        }

                        const updatedEmbed = new EmbedBuilder()
                            .setAuthor({name: '✅ Updating Complete'})
                            .setDescription(`Updated \`${membersLength}\` members.\n\`🟩\` Updated Users: \`${updatedUsers}\`\n\`🟥\` Failed Updates: \`${
                                failedUpdates}\``)
                            .setFooter({ text: `Guild Verification Bot • by @tocsikc` })
                            .setTimestamp()
                        
                        return interaction.editReply({ embeds: [updatedEmbed] })
                    }
                } catch (error) {
                    await errorLogger(interaction.client, error);

                    const errorEmbed = new EmbedBuilder()
                        .setColor(15548997)
                        .setAuthor({ name: "❌ An Error has occurred" })
                        .setDescription(`\`\`\`${error}\`\`\``)

                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            }
            case "nick": {
                const discord = interaction.options.getUser("discord");
                const nickname = interaction.options.getString("nickname");
                const discordId = discord.id;

                if (!nickname) {
                    const resetEmbed = new EmbedBuilder()
                        .setColor("4BB543")
                        .setAuthor({ name: "✅ Nickname Reset" })
                        .setDescription(`<@${discordId}>'s nickname has been removed.`);
                    
                    await removeNick(discordId);
                    await updateCommand.execute(interaction, {silent: true, discordId: discordId});
                    return interaction.reply({ embeds: [resetEmbed]})
                }
                const embed = new EmbedBuilder()
                    .setColor("4BB543")
                    .setAuthor({ name: "✅ Nickname Set" })
                    .setDescription(`<@${discordId}>'s nickname has been set to ${nickname}.`);

                await addNick(discordId, nickname);
                await nicknameLogger(interaction.client, discordId, nickname);
                
                await updateCommand.execute(interaction, {silent: true, discordId: discordId});
                return interaction.reply({ embeds: [embed]})
            }
        }
    }
};