const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { sleep } = require('../../contracts/helperFunctions.js');
const { addUser, inDB } = require('../../services/getLinked.js');
const { getUuidByUsername } = require('../../services/mojang.js');
const { errorLogger } = require('../../utils/logger.js');

const updateCommand = require("./update.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('force')
        .setDescription('Forcefully modify a user\'s verification status.')
        .addSubcommand(subcommand => 
            subcommand
			    .setName('verify')
			    .setDescription('Links Minecraft account to Discord.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account').setRequired(true))
                .addStringOption(option => option.setName('username').setDescription('Minecraft username').setRequired(true)),
        )
        .addSubcommand(subcommand => 
            subcommand
			    .setName('unverify')
			    .setDescription('Unlinks Minecraft account from Discord.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account').setRequired(true)),
        )
        .addSubcommand(subcommand => 
            subcommand
			    .setName('update')
			    .setDescription('Unlinks Minecraft account from Discord.')
                .addUserOption(option => option.setName('discord').setDescription('Discord account')),
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
                    const unverifyCommand = require("./unverify.js");

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
                        return interaction.reply({
                            content: `\`🛠️\` Work in progress (update everyone)`
                        });
                        // const db = await loadDB();
                        // const results = [];

                        // for (const discordID of Object.keys(db)) {
                        //     const user = await interaction.guild.members.fetch(discordID).catch(() => null);
                        //     if (!user) {
                        //         results.push(`❌ <@${discordID}>: not in discord.`);
                        //         continue;
                        //     }
                        //     const res = await updateCommand.execute(interaction, {silent: true, discordId: discordId, });
                        //     results.push(res);
                        // }
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
        }
    }
};