const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { sleep } = require('../../contracts/helperFunctions.js');
const { addUser, inDB } = require('../../services/getLinked.js');
const { getUuidByUsername } = require('../../services/mojang.js');
const updateCommand = require("./update.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('force')
        .setDescription('Forcefully modify a user\'s verification status.')
        .addSubcommand(subcommand => 
            subcommand
			    .setName('verify')
			    .setDescription('Links Minecraft account to Discord.')
                .addStringOption(option => option.setName('username').setDescription('Minecraft username').setRequired(true))
                .addUserOption(option => option.setName('discord').setDescription('Discord account').setRequired(true)),
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
                    await interaction.deferReply({flags: MessageFlags.Ephemeral});
                    await interaction.editReply({
                        content: `\`🔗\` Attempting to link user...`
                    });

                    const discord = interaction.options.getUser("discord");
                    const discordId = discord.id;

                    const username = interaction.options.getString("username");
                    const uuid = await getUuidByUsername(username);

                    if (await inDB(discordId, uuid) === 'discord') {
                        return interaction.editReply({
                            content: '\`❌\` This account is already linked. \n-# Use /force unverify to unlink account.'
                        });
                    } else if (await inDB(discordId, uuid) === 'minecraft') {
                        return interaction.editReply({
                            content: `\`❌\` \`${username}\` is linked to another Discord account.`
                        });
                    }

                    await addUser(discordId, uuid);

                    const embed = new EmbedBuilder()
                        .setColor("4BB543")
                        .setAuthor({ name: "✅ Account linked" })
                        .setDescription(`User <@${discordId}> (\`${username}\`) has been verified.`)

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
        }
    }
};